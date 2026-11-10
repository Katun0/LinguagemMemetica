from __future__ import annotations
import argparse
import sys
from pathlib import Path
from .compiler import compile_source, SemanticError, SemanticAnalyzer
from .lexer import Lexer, LexicalError
from .parser import Parser, ParseError


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Compilador RageLang -> C#")
    parser.add_argument("source", help="arquivo .rage de entrada")
    parser.add_argument("-o", "--output", help="arquivo .cs de saída (por padrão, stdout)")
    parser.add_argument("--check", action="store_true", help="apenas valida léxico, sintaxe e semântica")
    args = parser.parse_args(argv)
    try:
        source = Path(args.source).read_text(encoding="utf-8")
        if args.check:
            SemanticAnalyzer().analyze(Parser(Lexer(source).tokenize()).parse())
            print("OK: análise léxica, sintática e semântica concluídas.")
            return 0
        output = compile_source(source)
        if args.output:
            Path(args.output).write_text(output, encoding="utf-8")
            print(f"C# gerado em {args.output}")
        else:
            print(output, end="")
        return 0
    except (OSError, LexicalError, ParseError, SemanticError) as exc:
        print(f"ERRO: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
