function syntacticAnalysis(tokens) {
    const clean = tokens.filter(t => t.token !== "COMENTARIO");
    const errors = [];
    const tree = [];
    let i = 0;

    while (i < clean.length) {
        const current = clean[i];

        if (current.token === "ERROR_LEXICO") {
            i++;
            continue;
        }

        if (current.token === "IDENTIFICADOR") {
            const assign = clean[i + 1];
            const firstExpr = clean[i + 2];

            if (!assign || assign.token !== "ASIGNACION") {
                errors.push(`Línea ${current.line}: se esperaba '=' después de '${current.lexeme}'`);
                i++;
                continue;
            }

            if (!firstExpr || !isExpressionStart(firstExpr)) {
                errors.push(`Línea ${current.line}: asignación incompleta en '${current.lexeme}'`);
                i += 2;
                continue;
            }

            const expression = [];
            i += 2;

            while (i < clean.length && isExpressionPart(clean[i])) {
                expression.push(clean[i]);
                i++;
            }

            tree.push({
                type: "ASSIGNMENT",
                variable: current.lexeme,
                expression,
                line: current.line
            });

            continue;
        }

        if (current.lexeme === "if") {
            const condition = [];
            i++;

            while (i < clean.length && clean[i].lexeme !== ":") {
                condition.push(clean[i]);
                i++;
            }

            if (condition.length < 3) {
                errors.push(`Línea ${current.line}: condición if incompleta`);
            }

            if (!clean[i] || clean[i].lexeme !== ":") {
                errors.push(`Línea ${current.line}: se esperaba ':' al final del if`);
            } else {
                i++;
            }

            tree.push({
                type: "IF_STATEMENT",
                condition,
                line: current.line
            });

            continue;
        }

        if (current.lexeme === "print") {
            const open = clean[i + 1];
            const arg = clean[i + 2];
            const close = clean[i + 3];

            if (!open || open.lexeme !== "(") {
                errors.push(`Línea ${current.line}: se esperaba '(' después de print`);
            }

            if (!arg || !isExpressionStart(arg)) {
                errors.push(`Línea ${current.line}: print requiere una expresión`);
            }

            if (!close || close.lexeme !== ")") {
                errors.push(`Línea ${current.line}: se esperaba ')'`);
            }

            tree.push({
                type: "PRINT_STATEMENT",
                argument: arg ? [arg] : [],
                line: current.line
            });

            i += 4;
            continue;
        }

        if (["(", ")", ":", ","].includes(current.lexeme)) {
            i++;
            continue;
        }

        errors.push(`Línea ${current.line}: estructura no reconocida cerca de '${current.lexeme}'`);
        i++;
    }

    return {
        errors,
        syntaxTree: tree
    };
}

function isExpressionStart(token) {
    return ["IDENTIFICADOR", "NUMERO_ENTERO", "NUMERO_DECIMAL", "CADENA"].includes(token.token);
}

function isExpressionPart(token) {
    return isExpressionStart(token) ||
           token.token === "OPERADOR_ARITMETICO" ||
           token.token === "OPERADOR_RELACIONAL";
}
