from __future__ import annotations

import argparse
import sys
from pathlib import Path
from .compiler import compile_source, SemanticError
from .lexer import LexicalError
from .parser import ParseError, Parser
from .compiler import SemanticAnalyzer
from .lexer import Lexer


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Tradutor da linguagem memética RageLang para C#")
    parser.add_argument("source", help="arquivo .rage de entrada")
    parser.add_argument("-o", "--output", help="arquivo .cs de saída; sem esta opção imprime no terminal")
    parser.add_argument("--check", action="store_true", help="somente verifica léxico, sintático e semântico")
    args = parser.parse_args(argv)
    try:
        source = Path(args.source).read_text(encoding="utf-8")
        if args.check:
            tree = Parser(Lexer(source).tokenize()).parse()
            SemanticAnalyzer().analyze(tree)
            print("OK: programa válido nos níveis léxico, sintático e semântico.")
            return 0
        output = compile_source(source)
        if args.output:
            Path(args.output).write_text(output, encoding="utf-8")
            print(f"C# gerado em {args.output}")
        else:
            print(output, end="")
        return 0
    except (OSError, LexicalError, ParseError, SemanticError) as error:
        print(f"ERRO: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
