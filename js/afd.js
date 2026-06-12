function renderAFDSection() {
    const container = document.getElementById("afdContainer");

    container.innerHTML = `
        ${afdTable("AFD — Identificadores", [
            ["q0", "letra o _", "q1 ✓"],
            ["q1", "letra, dígito o _", "q1 ✓"]
        ])}

        ${afdTable("AFD — Números", [
            ["q0", "dígito", "q1 ✓"],
            ["q1", "dígito", "q1 ✓"],
            ["q1", ".", "q2"],
            ["q2", "dígito", "q3 ✓"],
            ["q3", "dígito", "q3 ✓"]
        ])}

        ${afdTable("AFD — Cadenas", [
            ["q0", '"', "q1"],
            ["q1", "carácter diferente de \"", "q1"],
            ["q1", '"', "q2 ✓"]
        ])}

        ${afdTable("AFD — Palabra reservada if", [
            ["q0", "i", "q1"],
            ["q1", "f", "q2 ✓"]
        ])}
    `;

    drawMDD();
}

function afdTable(title, rows) {
    return `
        <div class="afd-card">
            <h3>${title}</h3>
            <table>
                <thead>
                    <tr><th>Estado</th><th>Entrada</th><th>Siguiente</th></tr>
                </thead>
                <tbody>
                    ${rows.map(r => `<tr><td>${r[0]}</td><td>${escapeHtml(r[1])}</td><td>${r[2]}</td></tr>`).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function testAFD() {
    const input = document.getElementById("afdInput").value.trim();
    const result = document.getElementById("afdResult");

    if (!input) {
        result.textContent = "Ingrese un lexema para analizar.";
        return;
    }

    let out = `Lexema: ${input}\n\n`;

    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(input)) {
        out += "AFD seleccionado: Identificador / palabra reservada\n";
        out += "Recorrido: q0 → q1 → q1*\n";
        out += "Resultado: " + (RESERVED_WORDS.includes(input) ? "PALABRA_RESERVADA" : "IDENTIFICADOR");
    } else if (/^[0-9]+$/.test(input)) {
        out += "AFD seleccionado: Número entero\n";
        out += "Recorrido: q0 → q1*\n";
        out += "Resultado: NUMERO_ENTERO";
    } else if (/^[0-9]+\.[0-9]+$/.test(input)) {
        out += "AFD seleccionado: Número decimal\n";
        out += "Recorrido: q0 → q1 → q2 → q3*\n";
        out += "Resultado: NUMERO_DECIMAL";
    } else if (/^"[^"]*"$/.test(input)) {
        out += "AFD seleccionado: Cadena\n";
        out += "Recorrido: q0 → q1 → q2*\n";
        out += "Resultado: CADENA";
    } else if (/^(==|!=|>=|<=|>|<)$/.test(input)) {
        out += "AFD seleccionado: Operador relacional\n";
        out += "Resultado: OPERADOR_RELACIONAL";
    } else if (/^[+\-*/]$/.test(input)) {
        out += "AFD seleccionado: Operador aritmético\n";
        out += "Resultado: OPERADOR_ARITMETICO";
    } else {
        out += "Resultado: ERROR_LEXICO";
    }

    result.textContent = out;
}

function drawMDD() {
    const svg = document.getElementById("mddSvg");

    svg.innerHTML = `
        <defs>
            <marker id="arrowMDD" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill="#2563eb"></path>
            </marker>
        </defs>

        ${state(120, 210, "q0", "Inicio")}
        ${state(360, 80, "qID", "Identificador")}
        ${state(360, 210, "qNUM", "Número")}
        ${state(360, 340, "qSTR", "Cadena")}
        ${state(650, 80, "qOP", "Operador")}
        ${state(650, 210, "qDEL", "Delimitador")}
        ${state(650, 340, "qERR", "Error")}

        ${arrow(170, 200, 300, 95, "letra / _")}
        ${arrow(170, 210, 300, 210, "dígito")}
        ${arrow(170, 220, 300, 325, '"')}
        ${arrow(420, 95, 590, 95, "+ - * / < > = !")}
        ${arrow(420, 210, 590, 210, "( ) : ,")}
        ${arrow(420, 325, 590, 325, "otro")}
    `;
}

function state(x, y, title, subtitle) {
    return `
        <rect x="${x - 65}" y="${y - 32}" width="130" height="64" rx="12"
              fill="white" stroke="#2563eb" stroke-width="2"></rect>
        <text x="${x}" y="${y - 5}" text-anchor="middle" font-weight="bold" fill="#1e40af">${title}</text>
        <text x="${x}" y="${y + 17}" text-anchor="middle" font-size="12" fill="#64748b">${subtitle}</text>
    `;
}

function arrow(x1, y1, x2, y2, label) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2 - 10;

    return `
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
              stroke="#2563eb" stroke-width="2" marker-end="url(#arrowMDD)"></line>
        <text x="${mx}" y="${my}" text-anchor="middle" fill="#1e40af" font-size="12">${escapeHtml(label)}</text>
    `;
}
