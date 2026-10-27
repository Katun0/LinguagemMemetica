# RageLang 
## A linguagem de programação da Era de Ouro dos Memes

*RageLang* é uma linguagem de programação conceitual inspirada nos clássicos Rage Comics da internet. Cada comando, estrutura de controle e conceito possui uma representação memética, tornando o aprendizado de programação mais divertido e memorável.

  `Derp pensa. Derpina verifica. Trollface quebra tudo. Forever Alone fica preso no loop.`
  
---

## 1. Filosofia da linguagem

A RageLang combina conceitos tradicionais de programação com o humor da internet dos anos 2000 e início dos anos 2010.

Seus princípios são:

Memética: cada conceito possui uma identidade visual inspirada em um Rage Comic.
Legibilidade: o código deve ser fácil de entender.
Previsibilidade: estruturas de controle seguem regras convencionais.
Humor: erros e situações inesperadas fazem parte da experiência.

Status: especificação conceitual. A sintaxe apresentada neste documento é ilustrativa e ainda não corresponde a uma linguagem executável.

---

## 2. Tipos de dados

Os tipos de dados definem quais valores podem ser armazenados e manipulados.

| Tipo	| Exemplo	| Tradução memética |
| -- | -- | -- |
| Inteiro (int)	| 9000	| It's Over 9000! — um valor absurdo.
| Booleano (bool)	| true	| Fuck Yeah Guy — condição verdadeira.
| Booleano (bool)	| false	| No Guy — condição falsa.
| String (string)	| "Forever Alone"	| Uma sequência de caracteres.
| Lista (list)	| ["Derp", "Derpina"]	| Cereal Guy — vários elementos reunidos.
| Nulo (null)	| null	| Forever Alone — ausência de valor.
| Indefinido (undefined) |	undefined	| Poker Face — valor ainda não definido.

---

## 2.1. Exemplos
`
inteiro nivel = 9000
booleano trollagem = verdadeiro
string personagem = "Forever Alone"
lista memes = ["Trollface", "Derp", "Me Gusta"]
`
A sintaxe acima ilustra como uma declaração de variável poderia funcionar na RageLang.

---

## 3. Variáveis e constantes

### 3.1. Variáveis — Poker Face

Uma variável armazena um valor que pode ser alterado durante a execução.

`
variavel humor = "feliz"
humor = "revoltado"
`

Regra: uma variável pode receber novos valores compatíveis com o tipo definido pela linguagem.

### 3.2. Constantes — True Story 🗿

Uma constante representa um valor que não pode ser reatribuído depois de sua inicialização.

`
constante LIMITE = 9000
`

Tentar modificar LIMITE deve produzir um erro.

## 4. Operadores

Os operadores permitem realizar cálculos, comparar valores e combinar condições.

|Operador	| Significado	| Tradução memética |
| -- | -- | -- |
| +	| Adição |	Aww Yeah|
| -	|Subtração|	Me Gusta não|
| *	|Multiplicação|	X All the Y|
| /	|Divisão|	Derp|
| == |	Igualdade|	Me Gusta|
| != |Diferença|	Me Gusta não|
| >	| Maior que|	It's Over 9000!|
| <	| Menor que|	Not Bad|
| && |	E |lógico	Me Gusta + Me Gusta|
| `	|	` |
| !	| Negação | lógica	Trollface|

Exemplo

`
inteiro poder = 9001
se (poder > 9000) {
    imprimir("It's Over 9000!")
}
`

## 5. Estruturas de controle

As estruturas de controle determinam quais instruções serão executadas e quantas vezes serão repetidas.

## 5.1. if — Derp

Executa um bloco se uma condição for verdadeira.

`
se (humor == "feliz") {
    imprimir("Aww Yeah!")
}
`

Tradução: Derp verifica a condição antes de agir.

## 5.2. else if — Derpina

Testa uma nova condição quando a anterior não é verdadeira.

`
se (humor == "feliz") {
    imprimir("Aww Yeah!")
} senao_se (humor == "revoltado") {
    imprimir("Rage Guy!")
}
`

Tradução: Derpina considera outra possibilidade.

## 5.3. else — I Lied

Executa quando nenhuma das condições anteriores foi satisfeita.

`
se (nivel > 9000) {
    imprimir("It's Over 9000!")
} senao {
    imprimir("I Lied!")
}
`

Tradução: a expectativa falhou e o resultado mudou.

## 5.4. while — Forever Alone

Repete um bloco enquanto a condição permanecer verdadeira.

`
inteiro contador = 0
enquanto (contador < 3) {
    imprimir("Forever Alone")
    contador = contador + 1
}
`

Tradução: Forever Alone permanece preso no ciclo até a condição deixar de ser verdadeira.

## 5.5. do-while — Challenge Accepted

Executa o bloco pelo menos uma vez e verifica a condição depois.

`
inteiro tentativas = 0
faca {
    imprimir("Challenge Accepted!")
    tentativas = tentativas + 1
} enquanto (tentativas < 3)
`

Tradução: primeiro faz, depois verifica se deve continuar.

## 5.6. for — FORever Alone

Executa um bloco com uma inicialização, uma condição e uma atualização.

text
para (inteiro i = 0; i < 3; i = i + 1) {
    imprimir("Iteração")
}


Tradução: cada iteração é uma nova tentativa de escapar da solidão.

## 6. Controle de repetição
### 6.1. break — Rage Guy 🤬

Interrompe imediatamente o laço mais interno.

`
para (inteiro i = 0; i < 10; i = i + 1) {
    se (i == 3) {
        interromper
    }
}
`

Tradução: `“CHEGA! Acabou a repetição!”`

## 6.2. continue — Y U NO Guy 😠

Pula o restante da iteração atual e avança para a próxima.

`
para (inteiro i = 0; i < 5; i = i + 1) {
    se (i == 2) {
        continuar
    }
    imprimir(i)
}
`

Resultado esperado: `0, 1, 3, 4.`

Tradução: ignora esta situação e passa para a próxima.

## 7. Funções
### 7.1. function — Cereal Guy

Uma função agrupa instruções para executar uma tarefa reutilizável.

`
funcao saudacao(nome) {
    retornar "Me Gusta, " + nome
}
imprimir(saudacao("Derp"))
`

Resultado esperado:

`Me Gusta, Derp`

## 7.2. return — Not Bad

Devolve um resultado ao código que chamou a função e encerra sua execução.

`
funcao somar(a, b) {
    retornar a + b
}
`

Tradução: a função concluiu o trabalho e entregou o resultado.

## 7.3. Recursão — Trollface

A recursão acontece quando uma função chama a si mesma.

`
funcao contar(n) {
    se (n <= 0) {
        retornar 0
    }
    retornar contar(n - 1)
}
`

Tradução: Trollface invoca Trollface, até que a condição de parada interrompa a brincadeira.

## 8. Tratamento de erros
### 8.1. try — Fuck Yeah Guy 😎

Define um bloco de código que pode gerar uma exceção.

### 8.2. catch — Oh Crap 😱

Define como tratar uma exceção capturada.

### 8.3. finally — Okay Guy 😐

Define um bloco de finalização que será executado após a tentativa e o tratamento da exceção, conforme as regras da linguagem.

`
tente {
    imprimir("Executando...")
} capture (erro) {
    imprimir("Oh Crap!")
} finalmente {
    imprimir("Okay.")
}
`

Tradução: tenta executar, reage ao erro e finaliza o processo.

Nota: tente, capture e finalmente são palavras-chave propostas para a sintaxe conceitual.

## 9. Valores lógicos

| Valor	| Significado	| Tradução memética | 
| -- | -- | -- |
| verdadeiro | Condição verdadeira |	Fuck Yeah Guy
| falso |	Condição falsa |	No Guy
| nulo  |	Ausência intencional de valor |	Forever Alone
| indefinido | Valor ainda não definido	| Poker Face

Esses valores não são intercambiáveis. Em particular, nulo e indefinido representam conceitos diferentes quando ambos são suportados pela linguagem.

10. Listas e coleções

Uma lista armazena vários elementos em uma única estrutura.

`
lista rage_faces = [
    "Trollface",
    "Forever Alone",
    "Me Gusta",
    "Y U NO"
]
imprimir(rage_faces[0])
`

Resultado esperado: `Trollface.`

Os índices do exemplo começam em zero.

Tradução: Cereal Guy reúne vários memes em uma única tigela.

## 11. Depuração e comentários
### 11.1. Bug — Rage Guy 🤬

Um bug é um defeito que faz o programa apresentar comportamento incorreto ou inesperado.

### 11.2. Debug — Not Bad 🔍

Depurar é investigar e corrigir defeitos no programa.

### 11.3. Comentários — Cereal Guy 💬

Comentários documentam o código e não são executados como instruções.

`
// Trollface: verificar se o poder ultrapassou 9000.
inteiro poder = 9001
`

A sintaxe // é uma convenção ilustrativa adotada neste documento.

## 12. Loop infinito — Forever Alone ♾️

Um loop infinito ocorre quando a condição de repetição nunca se torna falsa e nenhuma instrução interrompe o ciclo.

`
enquanto (verdadeiro) {
    imprimir("Forever Alone")
}
`

Atenção: esse exemplo é intencionalmente infinito. Executá-lo sem um mecanismo de interrupção pode consumir recursos indefinidamente.

## 13. Exemplo completo

O programa a seguir reúne variáveis, condicionais, laços e funções em um único exemplo conceitual.


`
constante LIMITE = 9000
funcao avaliar_poder(poder) {
    se (poder > LIMITE) {
        retornar "It's Over 9000!"
    } senao_se (poder == LIMITE) {
        retornar "Not Bad"
    } senao {
        retornar "Forever Alone"
    }
}
para (inteiro i = 8998; i <= 9001; i = i + 1) {
    imprimir(avaliar_poder(i))
}
`

*Saída esperada:*

`
Forever Alone
Not Bad
It's Over 9000!
It's Over 9000!
`


A saída ilustra como uma condição pode alterar o resultado de uma função a cada iteração.

## 14. Referência rápida
| Conceito | Meme |
| -- | -- |
| Condição if	| Derp
| Condição alternativa | Derpina
| Caso padrão else | I Lied
| Repetição while	| Forever Alone
| Repetição do-while	| Challenge Accepted
| Repetição for	| FORever Alone
| Variável	| Poker Face
| Constante	| True Story
| Interrupção break	| Rage Guy
| Próxima iteração continue	| Y U NO Guy
| Função	| Cereal Guy
| Retorno return	| Not Bad
| Tentativa try	| Fuck Yeah Guy
| Captura catch	| Oh Crap
| Finalização finally	| Okay Guy
| Verdadeiro	| Fuck Yeah Guy
| Falso	| No Guy
| Valor nulo | Forever Alone
| Igualdade	| Me Gusta
| Negação	| Trollface
| Bug	| Rage Guy
| Depuração	| Not Bad
| Loop infinito	| Forever Alone

## 15. Conclusão

A RageLang transforma estruturas tradicionais de programação em uma linguagem visual e humorística inspirada nos Rage Comics.

Seu objetivo é facilitar a memorização de conceitos por meio de associações entre comandos e personagens clássicos da internet.

Estado atual: documentação conceitual, com exemplos de sintaxe e comportamento esperado. Uma implementação real ainda precisaria definir formalmente a gramática, os tipos, as regras de execução e o tratamento de erros.
