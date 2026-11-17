# RageLang — compilador em Python para C#

Este projeto **é um compilador/transpilador escrito em Python**: recebe arquivos `.rage`, faz análise léxica, sintática e semântica, e produz **código-fonte C#**. A execução do C# exige um ambiente .NET separado. A RageLang não é Python e ainda não é um interpretador independente.

## Estrutura

- `ragelang/lexer.py`: tokens, palavras reservadas e erros léxicos.
- `ragelang/parser.py`: parser descendente recursivo e árvore sintática abstrata (AST).
- `ragelang/compiler.py`: análise semântica (tipos, símbolos, escopo e constantes) e gerador de C#.
- `ragelang/cli.py`: interface de linha de comando.
- `examples/`: programas `.rage` para verificar sucesso e erros.
- `tests/`: testes unitários.
- `GRAMATICA.ebnf`: descrição simplificada da gramática da versão atual.

## Como usar

A partir da **raiz do projeto**, com Python 3.10+:

```bash
python -m ragelang.cli examples/completo.rage --check
python -m ragelang.cli examples/completo.rage -o Programa.cs
python -m unittest discover -s tests -v
```

Para executar o C# gerado, é necessário instalar um SDK .NET. Exemplo, em projeto console:

```bash
dotnet new console -o RageExecutavel
# substituir RageExecutavel/Program.cs pelo Programa.cs gerado
dotnet run --project RageExecutavel
```

## Sintaxe implementada

```text
POKER_FACE OVER_9000 idade = 20;
TRUE_STORY ME_GUSTA meme = "Not Bad";
DERP (idade >= 18) {
    CEREAL_GUY(meme);
} I_LIED {
    CEREAL_GUY("Forever Alone");
}
```

| RageLang | Significado |
|---|---|
| `POKER_FACE`, `TRUE_STORY` | variável, constante |
| `OVER_9000`, `ME_GUSTA`, `FUCK_YEAH` | inteiro, string, booleano |
| `DERP`, `I_LIED` | se, senão (também `I_LIED DERP`) |
| `FOREVER_ALONE`, `BREAK` | enquanto, interromper |
| `CEREAL_GUY`, `ASK_ME_ANYTHING` | imprimir, ler |
| `VERDADEIRO`, `NO_GUY` | valores booleanos |

A linguagem também aceita vários sinônimos em português, como `SE`, `ENQUANTO` e `IMPRIMIR`, **em letras maiúsculas**. O fim de cada declaração ou comando simples usa `;`. Blocos usam `{ }`.

## Limites conhecidos

- `NOT_BAD` / `RETORNAR` são palavras reservadas, **mas funções e retornos ainda não foram implementados**.
- `for`, `do-while`, listas, try/catch e `continue` ainda não foram implementados.
- `int` usa a semântica do C# (divisão inteira para `int / int`).
- `ASK_ME_ANYTHING` usa `int.Parse`, `bool.Parse` ou `Console.ReadLine`; entrada inválida pode gerar exceção ao executar.
- Comparação relacional entre strings é rejeitada porque os operadores `<`, `>` etc. não se aplicam a `string` em C#.
- Variáveis declaradas em blocos têm escopo local; não podem ocultar variáveis externas.
- A análise é estática; não verifica loops infinitos nem divisão por zero em tempo de execução.

## Melhorias realizadas

- Escopos de blocos e isolamento de variáveis de `if`/`while`.
- Proteção de constantes contra escrita pelo comando de leitura.
- Tipo da entrada associado diretamente ao nó `Read` em vez de consulta global ambígua.
- Correção de nomes reservados do C# com identificadores `@nome`.
- Diagnóstico para tentativa de usar retorno ainda não implementado.
- Suporte a `I_LIED DERP` e instruções `;` vazias.
- Tratamento de escapes e validação de números inválidos.
- Casos de teste de regressão.

