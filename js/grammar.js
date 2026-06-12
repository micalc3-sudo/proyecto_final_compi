const GRAMMAR = [
    { id: 1, left: "<program>", right: ["<statement_list>"] },
    { id: 2, left: "<statement_list>", right: ["<statement>", "<statement_list>"] },
    { id: 3, left: "<statement_list>", right: ["ε"] },
    { id: 4, left: "<statement>", right: ["<assignment>"] },
    { id: 5, left: "<statement>", right: ["<if_statement>"] },
    { id: 6, left: "<statement>", right: ["<print_statement>"] },
    { id: 7, left: "<assignment>", right: ["IDENTIFICADOR", "ASIGNACION", "<expression>"] },
    { id: 8, left: "<if_statement>", right: ["PALABRA_RESERVADA", "<condition>", "DELIMITADOR", "<statement>"] },
    { id: 9, left: "<print_statement>", right: ["PALABRA_RESERVADA", "DELIMITADOR", "<expression>", "DELIMITADOR"] },
    { id: 10, left: "<condition>", right: ["<expression>", "OPERADOR_RELACIONAL", "<expression>"] },
    { id: 11, left: "<expression>", right: ["<term>", "<expression_prime>"] },
    { id: 12, left: "<expression_prime>", right: ["OPERADOR_ARITMETICO", "<term>", "<expression_prime>"] },
    { id: 13, left: "<expression_prime>", right: ["ε"] },
    { id: 14, left: "<term>", right: ["IDENTIFICADOR"] },
    { id: 15, left: "<term>", right: ["NUMERO_ENTERO"] },
    { id: 16, left: "<term>", right: ["NUMERO_DECIMAL"] },
    { id: 17, left: "<term>", right: ["CADENA"] }
];

const FIRST = {
    "<program>": ["IDENTIFICADOR", "PALABRA_RESERVADA"],
    "<statement_list>": ["IDENTIFICADOR", "PALABRA_RESERVADA", "ε"],
    "<statement>": ["IDENTIFICADOR", "PALABRA_RESERVADA"],
    "<assignment>": ["IDENTIFICADOR"],
    "<if_statement>": ["PALABRA_RESERVADA"],
    "<print_statement>": ["PALABRA_RESERVADA"],
    "<condition>": ["IDENTIFICADOR", "NUMERO_ENTERO", "NUMERO_DECIMAL", "CADENA"],
    "<expression>": ["IDENTIFICADOR", "NUMERO_ENTERO", "NUMERO_DECIMAL", "CADENA"],
    "<expression_prime>": ["OPERADOR_ARITMETICO", "ε"],
    "<term>": ["IDENTIFICADOR", "NUMERO_ENTERO", "NUMERO_DECIMAL", "CADENA"]
};

const FOLLOW = {
    "<program>": ["$"],
    "<statement_list>": ["$"],
    "<statement>": ["IDENTIFICADOR", "PALABRA_RESERVADA", "$"],
    "<assignment>": ["IDENTIFICADOR", "PALABRA_RESERVADA", "$"],
    "<if_statement>": ["IDENTIFICADOR", "PALABRA_RESERVADA", "$"],
    "<print_statement>": ["IDENTIFICADOR", "PALABRA_RESERVADA", "$"],
    "<condition>": ["DELIMITADOR"],
    "<expression>": ["OPERADOR_RELACIONAL", "DELIMITADOR", "$"],
    "<expression_prime>": ["OPERADOR_RELACIONAL", "DELIMITADOR", "$"],
    "<term>": ["OPERADOR_ARITMETICO", "OPERADOR_RELACIONAL", "DELIMITADOR", "$"]
};

const TERMINALS = [
    "IDENTIFICADOR",
    "PALABRA_RESERVADA",
    "NUMERO_ENTERO",
    "NUMERO_DECIMAL",
    "CADENA",
    "OPERADOR_ARITMETICO",
    "OPERADOR_RELACIONAL",
    "ASIGNACION",
    "DELIMITADOR",
    "$"
];

function getProduction(nonTerminal, terminal) {
    const map = {
        "<program>": { "IDENTIFICADOR": 1, "PALABRA_RESERVADA": 1 },
        "<statement_list>": { "IDENTIFICADOR": 2, "PALABRA_RESERVADA": 2, "$": 3 },
        "<statement>": { "IDENTIFICADOR": 4, "PALABRA_RESERVADA": 5 },
        "<assignment>": { "IDENTIFICADOR": 7 },
        "<if_statement>": { "PALABRA_RESERVADA": 8 },
        "<print_statement>": { "PALABRA_RESERVADA": 9 },
        "<condition>": { "IDENTIFICADOR": 10, "NUMERO_ENTERO": 10, "NUMERO_DECIMAL": 10, "CADENA": 10 },
        "<expression>": { "IDENTIFICADOR": 11, "NUMERO_ENTERO": 11, "NUMERO_DECIMAL": 11, "CADENA": 11 },
        "<expression_prime>": { "OPERADOR_ARITMETICO": 12, "OPERADOR_RELACIONAL": 13, "DELIMITADOR": 13, "$": 13 },
        "<term>": { "IDENTIFICADOR": 14, "NUMERO_ENTERO": 15, "NUMERO_DECIMAL": 16, "CADENA": 17 }
    };

    const id = map[nonTerminal]?.[terminal];
    return GRAMMAR.find(rule => rule.id === id) || null;
}
