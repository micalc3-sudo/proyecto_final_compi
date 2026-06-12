function updateMetrics(lexical, syntactic) {
    const totalErrors = lexical.errors.length + syntactic.errors.length;

    document.getElementById("metricLines").textContent = lexical.totalLines;
    document.getElementById("metricTokens").textContent = lexical.tokens.length;
    document.getElementById("metricSymbols").textContent = lexical.symbolTable.length;
    document.getElementById("metricErrors").textContent = totalErrors;

    updateStatus("lexicalStatus", lexical.errors.length === 0, "Léxico correcto", "Error léxico");
    updateStatus("syntaxStatus", syntactic.errors.length === 0, "Sintáctico correcto", "Error sintáctico");
}

function updateStatus(id, ok, okText, errText) {
    const el = document.getElementById(id);
    el.textContent = ok ? "✓ " + okText : "✕ " + errText;
    el.className = "status " + (ok ? "ok" : "err");
}

function renderErrorConsole(lexical, syntactic) {
    const box = document.getElementById("errorConsole");

    if (lexical.errors.length === 0 && syntactic.errors.length === 0) {
        box.style.color = "#16a34a";
        box.textContent = "✓ Análisis exitoso. No se encontraron errores.";
        return;
    }

    box.style.color = "#dc2626";

    let output = "";

    lexical.errors.forEach(e => {
        output += `[Léxico] Línea ${e.line}, columna ${e.column}: ${e.message}\n`;
    });

    syntactic.errors.forEach(e => {
        output += `[Sintáctico] ${e}\n`;
    });

    box.textContent = output;
}

function renderProcessTrace(lexical, syntactic) {
    let output = "[LEX] Inicio del análisis léxico.\n";

    lexical.tokens.slice(0, 100).forEach(t => {
        output += `[LEX] L${t.line}: ${formatTokenName(t.token)} (${t.code}) → ${t.lexeme}\n`;
    });

    output += `[LEX] Total de tokens: ${lexical.tokens.length}\n`;
    output += lexical.errors.length
        ? `[LEX] Errores léxicos encontrados: ${lexical.errors.length}\n`
        : "[LEX] Sin errores léxicos.\n";

    output += "\n[SYN] Inicio del análisis sintáctico LL(1).\n";

    syntactic.errors.length
        ? output += `[SYN] Errores sintácticos encontrados: ${syntactic.errors.length}\n`
        : output += "[SYN] Estructura aceptada por el subconjunto definido.\n";

    document.getElementById("processTrace").textContent = output;
}
