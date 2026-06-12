function drawSyntaxTree(tree, errors) {
    const container = document.getElementById("syntaxTreeCanvas");

    if (!container) return;

    if (!tree || tree.length === 0) {
        container.innerHTML = "<p>No se generó árbol sintáctico.</p>";
        return;
    }

    const width = Math.max(1200, tree.length * 340);
    const height = 520;
    const rootX = width / 2;

    let svg = `<svg class="tree-svg" viewBox="0 0 ${width} ${height}">`;

    svg += node(rootX, 40, "Programa", "normal");

    const startX = 160;
    const gap = 310;

    tree.forEach((item, index) => {
        const x = startX + index * gap;
        const y = 160;

        svg += line(rootX, 70, x, y - 30);

        if (item.type === "ASSIGNMENT") {
            svg += node(x, y, "Asignación", "normal");
            svg += branchAssignment(x, y, item);
        }

        if (item.type === "IF_STATEMENT") {
            svg += node(x, y, "Condicional IF", "normal");
            svg += branchIf(x, y, item);
        }

        if (item.type === "PRINT_STATEMENT") {
            svg += node(x, y, "Impresión", "normal");
            svg += branchPrint(x, y, item);
        }
    });

    if (errors && errors.length > 0) {
        svg += node(width - 170, 40, `Errores: ${errors.length}`, "error");
    }

    svg += "</svg>";
    container.innerHTML = svg;
}

function branchAssignment(x, y, item) {
    let svg = "";
    const nodes = [
        { x: x - 110, y: y + 120, text: item.variable, type: "terminal" },
        { x: x, y: y + 120, text: "=", type: "terminal" },
        { x: x + 130, y: y + 120, text: "Expresión", type: "normal" }
    ];

    nodes.forEach(n => {
        svg += line(x, y + 30, n.x, n.y - 30);
        svg += node(n.x, n.y, n.text, n.type);
    });

    const expr = item.expression.map(t => t.lexeme).join(" ");
    svg += line(x + 130, y + 150, x + 130, y + 235);
    svg += node(x + 130, y + 265, expr, "terminal");

    return svg;
}

function branchIf(x, y, item) {
    let svg = "";
    const condition = item.condition.map(t => t.lexeme).join(" ");

    const nodes = [
        { x: x - 95, y: y + 120, text: "if", type: "terminal" },
        { x: x + 30, y: y + 120, text: "Condición", type: "normal" },
        { x: x + 165, y: y + 120, text: ":", type: "terminal" }
    ];

    nodes.forEach(n => {
        svg += line(x, y + 30, n.x, n.y - 30);
        svg += node(n.x, n.y, n.text, n.type);
    });

    svg += line(x + 30, y + 150, x + 30, y + 235);
    svg += node(x + 30, y + 265, condition || "vacía", "terminal");

    return svg;
}

function branchPrint(x, y, item) {
    let svg = "";
    const arg = item.argument && item.argument[0] ? item.argument[0].lexeme : "expresión";

    const nodes = [
        { x: x - 140, y: y + 120, text: "print", type: "terminal" },
        { x: x - 30, y: y + 120, text: "(", type: "terminal" },
        { x: x + 80, y: y + 120, text: arg, type: "terminal" },
        { x: x + 190, y: y + 120, text: ")", type: "terminal" }
    ];

    nodes.forEach(n => {
        svg += line(x, y + 30, n.x, n.y - 30);
        svg += node(n.x, n.y, n.text, n.type);
    });

    return svg;
}

function node(x, y, text, type) {
    const cls = type === "terminal"
        ? "tree-node-box tree-terminal"
        : type === "error"
            ? "tree-node-box tree-error"
            : "tree-node-box";

    return `
        <rect class="${cls}" x="${x - 60}" y="${y - 24}" width="120" height="48"></rect>
        <text class="tree-text" x="${x}" y="${y + 5}" text-anchor="middle">${escapeHtml(text)}</text>
    `;
}

function line(x1, y1, x2, y2) {
    return `<line class="tree-line-svg" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>`;
}
