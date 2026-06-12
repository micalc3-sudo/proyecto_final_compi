function renderConwayButtons() {
    const container = document.getElementById("conwayButtons");
    container.innerHTML = "";

    GRAMMAR.forEach((rule, index) => {
        const btn = document.createElement("button");
        btn.textContent = `${rule.id}. ${rule.left.replace(/[<>]/g, "")}`;
        btn.className = index === 0 ? "active" : "";

        btn.addEventListener("click", () => {
            document.querySelectorAll("#conwayButtons button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            drawConwayDiagram(rule);
        });

        container.appendChild(btn);
    });

    drawConwayDiagram(GRAMMAR[0]);
}

function drawConwayDiagram(rule) {
    const svg = document.getElementById("conwaySvg");
    const symbols = ["Inicio", ...rule.right, "Fin"];
    const startX = 80;
    const y = 210;
    const gap = 155;
    const width = Math.max(1300, startX + symbols.length * gap + 100);

    svg.setAttribute("viewBox", `0 0 ${width} 420`);

    let html = `
        <defs>
            <marker id="arrowConway" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill="#2563eb"></path>
            </marker>
        </defs>

        <text x="${width / 2}" y="55" text-anchor="middle" fill="#1e40af" font-size="18" font-weight="bold">
            Regla ${rule.id}: ${escapeHtml(rule.left)} → ${escapeHtml(rule.right.join(" "))}
        </text>
    `;

    symbols.forEach((symbol, index) => {
        const x = startX + index * gap;
        const isTerminal = !symbol.startsWith("<") && symbol !== "Inicio" && symbol !== "Fin";

        html += `
            <rect x="${x - 55}" y="${y - 25}" width="110" height="50" rx="10"
                  fill="${isTerminal ? "#e0f2fe" : "#ffffff"}"
                  stroke="${isTerminal ? "#0284c7" : "#2563eb"}"
                  stroke-width="2"></rect>
            <text x="${x}" y="${y + 5}" text-anchor="middle" fill="#1e293b" font-size="13" font-weight="bold">
                ${escapeHtml(symbol)}
            </text>
        `;

        if (index < symbols.length - 1) {
            const x2 = startX + (index + 1) * gap - 60;

            html += `
                <line x1="${x + 60}" y1="${y}" x2="${x2}" y2="${y}"
                      stroke="#2563eb" stroke-width="2" marker-end="url(#arrowConway)"></line>
            `;
        }
    });

    if (rule.right.includes("ε")) {
        html += `
            <path d="M ${startX + 70} ${y + 70} C ${startX + 180} ${y + 150}, ${startX + 330} ${y + 150}, ${startX + 455} ${y + 70}"
                  fill="transparent" stroke="#f59e0b" stroke-width="3" stroke-dasharray="8 6"
                  marker-end="url(#arrowConway)"></path>
            <text x="${startX + 260}" y="${y + 150}" text-anchor="middle" fill="#92400e" font-weight="bold">
                Camino vacío ε
            </text>
        `;
    }

    svg.innerHTML = html;
}

function drawCustomConway() {
    const text = document.getElementById("customBnf").value.trim();
    const output = document.getElementById("customConwayOutput");

    if (!text) {
        output.innerHTML = "No hay reglas para dibujar.";
        return;
    }

    const lines = text.split("\n").filter(Boolean);

    output.innerHTML = lines.map(line => {
        const [left, right] = line.split("->").map(x => x.trim());

        if (!left || !right) return "";

        const symbols = right.split(/\s+/);

        return `
            <div class="custom-rule">
                <strong>${escapeHtml(left)} → ${escapeHtml(right)}</strong>
                <div class="custom-path">
                    <span>Inicio</span>
                    ${symbols.map(s => `<b>→</b><span>${escapeHtml(s)}</span>`).join("")}
                    <b>→</b><span>Fin</span>
                </div>
            </div>
        `;
    }).join("");
}
