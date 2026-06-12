let currentPhase = "complete";
let lastAnalysis = null;

document.addEventListener("DOMContentLoaded", () => {
    initializeUI();

    document.getElementById("btnAnalyze").addEventListener("click", analyze);
    document.getElementById("btnExample").addEventListener("click", loadValidExample);
    document.getElementById("btnErrorExample").addEventListener("click", loadErrorExample);
    document.getElementById("btnExpression").addEventListener("click", loadExpressionExample);
    document.getElementById("btnClear").addEventListener("click", clearAll);
    document.getElementById("btnReport").addEventListener("click", downloadReport);
    document.getElementById("btnTestAFD").addEventListener("click", testAFD);
    document.getElementById("btnCustomConway").addEventListener("click", drawCustomConway);
    document.getElementById("btnEvaluateExpression").addEventListener("click", evaluateExpression);

    document.querySelectorAll(".phase-btn").forEach(button => {
        button.addEventListener("click", () => {
            currentPhase = button.dataset.phase;
            document.querySelectorAll(".phase-btn").forEach(b => b.classList.remove("active"));
            button.classList.add("active");
            applyPhase();
        });
    });

    applyPhase();
});

function initializeUI() {
    renderRegexGrid();
    renderBNFList();
    renderFirstFollowTable();
    renderLL1Matrix();
    renderAFDSection();
    renderConwayButtons();
    drawCustomConway();
}

function analyze() {
    const code = document.getElementById("sourceCode").value;

    const lexical = lexicalAnalysis(code);
    const syntactic = syntacticAnalysis(lexical.tokens);
    const ll1Steps = runLL1Analysis(lexical.tokens);

    lastAnalysis = { code, lexical, syntactic, ll1Steps };

    updateMetrics(lexical, syntactic);
    renderTokens(lexical.tokens);
    renderSymbols(lexical.symbolTable);
    renderErrorConsole(lexical, syntactic);
    renderProcessTrace(lexical, syntactic);
    renderLL1Steps(ll1Steps);
    drawSyntaxTree(syntactic.syntaxTree, syntactic.errors);

    applyPhase();
}

function applyPhase() {
    document.querySelectorAll(".lexical-section").forEach(section => {
        section.classList.toggle("hidden", currentPhase === "syntax");
    });

    document.querySelectorAll(".syntax-section").forEach(section => {
        section.classList.toggle("hidden", currentPhase === "lexical");
    });
}

function loadValidExample() {
    document.getElementById("sourceCode").value = `x = 10
y = 20
resultado = x + y

if resultado > 25:
    print("Resultado mayor")`;
}

function loadErrorExample() {
    document.getElementById("sourceCode").value = `x =
if x > :
    print("cadena sin cerrar)`;
}

function loadExpressionExample() {
    document.getElementById("sourceCode").value = `a = 10 + 20 * 3
b = a - 5
print("Expresion lista")`;
}

function clearAll() {
    document.getElementById("sourceCode").value = "";
    document.getElementById("tokensTable").innerHTML = "";
    document.getElementById("symbolsTable").innerHTML = "";
    document.getElementById("ll1Steps").innerHTML = "";
    document.getElementById("syntaxTreeCanvas").innerHTML = "Presione “Ejecutar análisis” para generar el árbol.";
    document.getElementById("processTrace").textContent = "Presione “Ejecutar análisis”.";
    document.getElementById("errorConsole").textContent = "Sin análisis ejecutado.";
    document.getElementById("metricLines").textContent = "0";
    document.getElementById("metricTokens").textContent = "0";
    document.getElementById("metricSymbols").textContent = "0";
    document.getElementById("metricErrors").textContent = "0";

    document.getElementById("lexicalStatus").textContent = "Léxico pendiente";
    document.getElementById("lexicalStatus").className = "status pending";

    document.getElementById("syntaxStatus").textContent = "Sintáctico pendiente";
    document.getElementById("syntaxStatus").className = "status pending";

    lastAnalysis = null;
}

function downloadReport() {
    if (!lastAnalysis) {
        analyze();
    }

    const { code, lexical, syntactic, ll1Steps } = lastAnalysis;

    let report = "REPORTE DEL ANALIZADOR LÉXICO Y SINTÁCTICO\n";
    report += "Lenguaje: Python simplificado\n";
    report += "Fase seleccionada: " + currentPhase.toUpperCase() + "\n";
    report += "============================================\n\n";

    report += "CÓDIGO FUENTE:\n" + code + "\n\n";
    report += `Líneas: ${lexical.totalLines}\n`;
    report += `Tokens: ${lexical.tokens.length}\n`;
    report += `Identificadores: ${lexical.symbolTable.length}\n`;
    report += `Errores léxicos: ${lexical.errors.length}\n`;
    report += `Errores sintácticos: ${syntactic.errors.length}\n\n`;

    report += "TOKENS:\n";
    lexical.tokens.forEach(t => {
        report += `${t.id}. Línea ${t.line}, Columna ${t.column}, ${t.lexeme} → ${t.token}\n`;
    });

    report += "\nTABLA DE SÍMBOLOS:\n";
    lexical.symbolTable.forEach(s => {
        report += `${s.identifier} | ${s.type} | Línea ${s.line} | Asignado: ${s.assigned ? "Sí" : "No"}\n`;
    });

    report += "\nERRORES:\n";
    lexical.errors.forEach(e => report += `[Léxico] Línea ${e.line}: ${e.message}\n`);
    syntactic.errors.forEach(e => report += `[Sintáctico] ${e}\n`);

    report += "\nANÁLISIS LL(1):\n";
    ll1Steps.forEach(s => {
        report += `${s.step}. Pila: ${s.stack} | Entrada: ${s.input} | Acción: ${s.action}\n`;
    });

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte_analizador.txt";
    a.click();

    URL.revokeObjectURL(url);
}

function evaluateExpression() {
    const expression = document.getElementById("expressionInput").value;
    const result = shuntingYard(expression);

    document.getElementById("rpnOutput").textContent = result.output.join(" ");
    document.getElementById("expressionResult").textContent = result.value;

    document.getElementById("shuntingSteps").innerHTML = result.steps.map((s, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${s.token}</td>
            <td>${s.stack}</td>
            <td>${s.output}</td>
            <td>${s.action}</td>
        </tr>
    `).join("");
}

function shuntingYard(expression) {
    const tokens = expression.match(/\d+(\.\d+)?|[+\-*/()]|\w+/g) || [];
    const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };
    const stack = [];
    const output = [];
    const steps = [];

    tokens.forEach(token => {
        let action = "";

        if (/^\d/.test(token)) {
            output.push(token);
            action = "Operando → salida";
        } else if (/^[a-zA-Z_]/.test(token)) {
            output.push(token);
            action = "Identificador → salida";
        } else if (token in precedence) {
            while (stack.length && precedence[stack[stack.length - 1]] >= precedence[token]) {
                output.push(stack.pop());
            }

            stack.push(token);
            action = "Operador → pila";
        } else if (token === "(") {
            stack.push(token);
            action = "( → pila";
        } else if (token === ")") {
            while (stack.length && stack[stack.length - 1] !== "(") {
                output.push(stack.pop());
            }

            stack.pop();
            action = ") → desapilar";
        }

        steps.push({
            token,
            stack: stack.join(" "),
            output: output.join(" "),
            action
        });
    });

    while (stack.length) {
        output.push(stack.pop());
    }

    let value = "No evaluable con identificadores";

    if (output.every(x => /^\d/.test(x) || x in precedence)) {
        const evalStack = [];

        output.forEach(x => {
            if (/^\d/.test(x)) {
                evalStack.push(parseFloat(x));
            } else {
                const b = evalStack.pop();
                const a = evalStack.pop();

                if (x === "+") evalStack.push(a + b);
                if (x === "-") evalStack.push(a - b);
                if (x === "*") evalStack.push(a * b);
                if (x === "/") evalStack.push(a / b);
            }
        });

        value = evalStack[0];
    }

    return { output, value, steps };
}
