const RESERVED_WORDS = ["if", "else", "while", "for", "print", "def", "return", "and", "or", "not"];

const CATEGORY_META = {
    PALABRA_RESERVADA: { id: 1, code: "PR" },
    IDENTIFICADOR: { id: 3, code: "ID" },
    NUMERO_ENTERO: { id: 4, code: "NE" },
    NUMERO_DECIMAL: { id: 4, code: "ND" },
    CADENA: { id: 4, code: "CAD" },
    OPERADOR_ARITMETICO: { id: 6, code: "OA" },
    OPERADOR_RELACIONAL: { id: 7, code: "OR" },
    ASIGNACION: { id: 8, code: "AS" },
    DELIMITADOR: { id: 5, code: "DL" },
    COMENTARIO: { id: 9, code: "COM" },
    ERROR_LEXICO: { id: 0, code: "ERR" }
};

function lexicalAnalysis(code) {
    const tokens = [];
    const errors = [];
    const symbols = new Map();
    const lines = code.split("\n");
    let tokenId = 1;

    lines.forEach((line, lineIndex) => {
        let i = 0;

        while (i < line.length) {
            const char = line[i];

            if (char === " " || char === "\t") {
                i++;
                continue;
            }

            if (char === "#") {
                tokens.push(createToken(tokenId++, lineIndex + 1, i + 1, line.substring(i), "COMENTARIO"));
                break;
            }

            if (/[a-zA-Z_]/.test(char)) {
                const start = i;
                let lexeme = "";

                while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) {
                    lexeme += line[i];
                    i++;
                }

                const type = RESERVED_WORDS.includes(lexeme)
                    ? "PALABRA_RESERVADA"
                    : "IDENTIFICADOR";

                tokens.push(createToken(tokenId++, lineIndex + 1, start + 1, lexeme, type));

                if (type === "IDENTIFICADOR" && !symbols.has(lexeme)) {
                    symbols.set(lexeme, {
                        identifier: lexeme,
                        type: "Variable",
                        category: 3,
                        line: lineIndex + 1,
                        assigned: /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*=/.test(line)
                    });
                }

                continue;
            }

            if (/[0-9]/.test(char)) {
                const start = i;
                let lexeme = "";
                let dots = 0;

                while (i < line.length && /[0-9.]/.test(line[i])) {
                    if (line[i] === ".") dots++;
                    lexeme += line[i];
                    i++;
                }

                if (dots > 1 || lexeme.endsWith(".")) {
                    tokens.push(createToken(tokenId++, lineIndex + 1, start + 1, lexeme, "ERROR_LEXICO"));
                    errors.push({
                        line: lineIndex + 1,
                        column: start + 1,
                        message: "Número decimal inválido: " + lexeme
                    });
                } else {
                    tokens.push(createToken(
                        tokenId++,
                        lineIndex + 1,
                        start + 1,
                        lexeme,
                        dots === 1 ? "NUMERO_DECIMAL" : "NUMERO_ENTERO"
                    ));
                }

                continue;
            }

            if (char === '"') {
                const start = i;
                let lexeme = '"';
                i++;

                while (i < line.length && line[i] !== '"') {
                    lexeme += line[i];
                    i++;
                }

                if (i < line.length && line[i] === '"') {
                    lexeme += '"';
                    i++;
                    tokens.push(createToken(tokenId++, lineIndex + 1, start + 1, lexeme, "CADENA"));
                } else {
                    tokens.push(createToken(tokenId++, lineIndex + 1, start + 1, lexeme, "ERROR_LEXICO"));
                    errors.push({
                        line: lineIndex + 1,
                        column: start + 1,
                        message: "Cadena no cerrada"
                    });
                }

                continue;
            }

            const two = line.substring(i, i + 2);

            if (["==", "!=", ">=", "<="].includes(two)) {
                tokens.push(createToken(tokenId++, lineIndex + 1, i + 1, two, "OPERADOR_RELACIONAL"));
                i += 2;
                continue;
            }

            if (["<", ">"].includes(char)) {
                tokens.push(createToken(tokenId++, lineIndex + 1, i + 1, char, "OPERADOR_RELACIONAL"));
                i++;
                continue;
            }

            if (["+", "-", "*", "/"].includes(char)) {
                tokens.push(createToken(tokenId++, lineIndex + 1, i + 1, char, "OPERADOR_ARITMETICO"));
                i++;
                continue;
            }

            if (char === "=") {
                tokens.push(createToken(tokenId++, lineIndex + 1, i + 1, char, "ASIGNACION"));
                i++;
                continue;
            }

            if (["(", ")", "{", "}", "[", "]", ":", ",", ";"].includes(char)) {
                tokens.push(createToken(tokenId++, lineIndex + 1, i + 1, char, "DELIMITADOR"));
                i++;
                continue;
            }

            tokens.push(createToken(tokenId++, lineIndex + 1, i + 1, char, "ERROR_LEXICO"));
            errors.push({
                line: lineIndex + 1,
                column: i + 1,
                message: "Símbolo no reconocido: " + char
            });

            i++;
        }
    });

    return {
        tokens,
        errors,
        symbolTable: Array.from(symbols.values()),
        totalLines: lines.length
    };
}

function createToken(id, line, column, lexeme, token) {
    const meta = CATEGORY_META[token] || CATEGORY_META.ERROR_LEXICO;

    return {
        id,
        line,
        column,
        lexeme,
        token,
        category: meta.id,
        code: meta.code
    };
}
