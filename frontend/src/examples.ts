export const examples = {
  poder: {
    name: "Over 9000",
    detail: "Variáveis, condições e while",
    code: `// RageLang — It's Over 9000!
TRUE_STORY OVER_9000 limite = 9000;
POKER_FACE OVER_9000 poder = 8999;
POKER_FACE FUCK_YEAH acabou = NO_GUY;

FOREVER_ALONE (!acabou) {
    DERP (poder > limite) {
        CEREAL_GUY("It's Over 9000!");
        acabou = VERDADEIRO;
    } I_LIED DERP (poder == limite) {
        CEREAL_GUY("Not Bad");
    } I_LIED {
        CEREAL_GUY("Forever Alone");
    }
    poder = poder + 1;
}`,
  },
  olamundo: {
    name: "Hello, World!",
    detail: "Sua primeira mensagem",
    code: `// Olá, mundo memético!
POKER_FACE ME_GUSTA mensagem = "Hello, RageLang!";
CEREAL_GUY(mensagem);
CEREAL_GUY("Much Wow. Very code.");`,
  },
  contagem: {
    name: "Contador",
    detail: "Laços e operadores",
    code: `// Contagem regressiva
POKER_FACE OVER_9000 n = 5;
FOREVER_ALONE (n > 0) {
    CEREAL_GUY(n);
    n = n - 1;
}
CEREAL_GUY("Challenge Accepted!");`,
  },
  entrada: {
    name: "Entrada",
    detail: "Leia valores do terminal",
    code: `// Digite um número no campo Entrada
POKER_FACE OVER_9000 numero = 0;
ASK_ME_ANYTHING(numero);
DERP (numero > 9000) {
    CEREAL_GUY("It's Over 9000!");
} I_LIED {
    CEREAL_GUY("Not Bad");
}`,
  },
  erro: {
    name: "Erro semântico",
    detail: "Veja o compilador detectar falhas",
    code: `// Um inteiro não pode receber texto
POKER_FACE OVER_9000 idade = "vinte";
CEREAL_GUY(idade);`,
  },
} as const;
export type ExampleKey = keyof typeof examples;
export const keywords: [string, string, string][] = [
  ["POKER_FACE", "var", "Variável mutável"],
  ["TRUE_STORY", "const", "Constante"],
  ["OVER_9000", "int", "Número inteiro"],
  ["ME_GUSTA", "string", "Texto"],
  ["FUCK_YEAH", "bool", "Booleano"],
  ["DERP", "if", "Condição"],
  ["I_LIED", "else", "Alternativa"],
  ["FOREVER_ALONE", "while", "Laço"],
  ["CEREAL_GUY", "print", "Imprimir saída"],
  ["ASK_ME_ANYTHING", "read", "Ler entrada"],
  ["NO_GUY", "false", "Falso"],
  ["VERDADEIRO", "true", "Verdadeiro"],
  ["BREAK", "break", "Interromper repetição"],
];
