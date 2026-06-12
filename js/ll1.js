function runLL1Analysis(tokens) {
    const input = tokens
        .filter(t => t.token !== "COMENTARIO" && t.token !== "ERROR_LEXICO")
        .map(t => t.token);

    input.push("$");

    const stack = ["$", "<program>"];
    const steps = [];

    let index = 0;
    let step = 1;

    while (stack.length > 0 && step < 250) {
        const top = stack.pop();
        const current = input[index];
        let action = "";

        if (top === current) {
            action = `Coincide: consumir ${current}`;
            index++;
        } else if (top === "$" && current === "$") {
            action = "Cadena aceptada";
        } else if (!top.startsWith("<")) {
            action = `ERROR: se esperaba ${top}, se encontró ${current}`;
        } else {
            const production = getProduction(top, current);

            if (!production) {
                action = `ERROR: no existe M[${top}, ${current}]`;
            } else {
                action = `Expandir: ${top} → ${production.right.join(" ")}`;

                if (production.right[0] !== "ε") {
                    for (let i = production.right.length - 1; i >= 0; i--) {
                        stack.push(production.right[i]);
                    }
                }
            }
        }

        steps.push({
            step: step++,
            stack: [...stack].reverse().join(" "),
            input: input.slice(index).join(" "),
            action
        });

        if (action.includes("ERROR") || (top === "$" && current === "$")) {
            break;
        }
    }

    return steps;
}
