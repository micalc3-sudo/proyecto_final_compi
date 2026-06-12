function renderRegexGrid() {
    const items = [
        ["Palabra reservada", "if|else|while|for|print|def|return"],
        ["Identificador", "[a-zA-Z_][a-zA-Z0-9_]*"],
        ["Número entero", "[0-9]+"],
        ["Número decimal", "[0-9]+\\.[0-9]+"],
        ["Cadena", "\"[^\"]*\""],
        ["Operador aritmético", "[+\\-*/]"],
        ["Operador relacional", "==|!=|>=|<=|>|<"],
        ["Asignación", "="],
        ["Delimitador", "[(){}\\[\\]:,;]"],
        ["Comentario", "#.*"]
    ];

    document.getElementById("regexGrid").innerHTML = items.map(item => `
        <div class="regex-card">
            <strong>${item[0]}</strong>
            <code>${escapeHtml(item[1])}</code>
        </div>
    `).join("");
}

function renderBNFList() {
    document.getElementById("bnfList").innerHTML = GRAMMAR.map(rule => `
        <div class="bnf-row">
            <span>${rule.id}.</span>
            <span class="nonterminal">${escapeHtml(rule.left)}</span>
            <span>→ ${rule.right.map(formatSymbol).join(" ")}</span>
        </div>
    `).join("");
}

function renderFirstFollowTable() {
    const nonTerminals = Object.keys(FIRST);

    document.getElementById("firstFollowTable").innerHTML = nonTerminals.map(nt => `
        <tr>
            <td class="nonterminal">${escapeHtml(nt)}</td>
            <td>${(FIRST[nt] || []).map(x => `<span class="pill first">${escapeHtml(x)}</span>`).join(" ")}</td>
            <td>${(FOLLOW[nt] || []).map(x => `<span class="pill follow">${escapeHtml(x)}</span>`).join(" ")}</td>
        </tr>
    `).join("");
}

function renderLL1Matrix() {
    const nonTerminals = Object.keys(FIRST);
    let html = "<thead><tr><th>NT \\ T</th>";

    TERMINALS.forEach(t => {
        html += `<th>${escapeHtml(t)}</th>`;
    });

    html += "</tr></thead><tbody>";

    nonTerminals.forEach(nt => {
        html += `<tr><th>${escapeHtml(nt)}</th>`;

        TERMINALS.forEach(t => {
            const prod = getProduction(nt, t);

            html += `<td>${
                prod
                    ? `<span class="pill first">${prod.id}</span> ${escapeHtml(nt)} → ${escapeHtml(prod.right.join(" "))}`
                    : "<span style='color:#dc2626'>-</span>"
            }</td>`;
        });

        html += "</tr>";
    });

    html += "</tbody>";
    document.getElementById("ll1Matrix").innerHTML = html;
}

function renderTokens(tokens) {
    const tbody = document.getElementById("tokensTable");
    tbody.innerHTML = "";

    tokens.forEach(t => {
        tbody.innerHTML += `
            <tr>
                <td>${t.id}</td>
                <td>${t.line}</td>
                <td>${t.column}</td>
                <td>${escapeHtml(t.lexeme)}</td>
                <td>${formatTokenName(t.token)}</td>
                <td><span class="token-code">${t.code}</span></td>
            </tr>
        `;
    });
}

function renderSymbols(symbols) {
    const tbody = document.getElementById("symbolsTable");
    tbody.innerHTML = "";

    symbols.forEach(s => {
        tbody.innerHTML += `
            <tr>
                <td>${escapeHtml(s.identifier)}</td>
                <td>${s.type}</td>
                <td>${s.category}</td>
                <td>${s.line}</td>
                <td>${s.assigned ? "✓ Sí" : "No"}</td>
            </tr>
        `;
    });
}

function renderLL1Steps(steps) {
    document.getElementById("ll1Steps").innerHTML = steps.map(s => `
        <tr>
            <td>${s.step}</td>
            <td>${escapeHtml(s.stack)}</td>
            <td>${escapeHtml(s.input)}</td>
            <td>${escapeHtml(s.action)}</td>
        </tr>
    `).join("");
}

function formatSymbol(s) {
    if (s === "ε") return `<span class="epsilon">ε</span>`;
    if (s.startsWith("<")) return `<span class="nonterminal">${escapeHtml(s)}</span>`;
    return `<span class="terminal">${escapeHtml(s)}</span>`;
}

function formatTokenName(token) {
    return token.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, m => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[m]));
}
