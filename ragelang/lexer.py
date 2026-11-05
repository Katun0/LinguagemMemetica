from __future__ import annotations

from dataclasses import dataclass
from enum import Enum, auto


class LexicalError(Exception):
    pass


class TokenType(Enum):
    EOF = auto()
    IDENT = auto()
    INT = auto()
    STRING = auto()
    VAR = auto()
    CONST = auto()
    IF = auto()
    ELSE = auto()
    WHILE = auto()
    PRINT = auto()
    READ = auto()
    RETURN = auto()
    BREAK = auto()
    TYPE_INT = auto()
    TYPE_STRING = auto()
    TYPE_BOOL = auto()
    TRUE = auto()
    FALSE = auto()
    PLUS = auto()
    MINUS = auto()
    STAR = auto()
    SLASH = auto()
    ASSIGN = auto()
    EQ = auto()
    NE = auto()
    GT = auto()
    GE = auto()
    LT = auto()
    LE = auto()
    AND = auto()
    OR = auto()
    NOT = auto()
    LPAREN = auto()
    RPAREN = auto()
    LBRACE = auto()
    RBRACE = auto()
    SEMI = auto()
    COMMA = auto()


@dataclass(frozen=True)
class Token:
    type: TokenType
    lexeme: str
    line: int
    column: int


KEYWORDS = {
    "POKER_FACE": "VAR",
    "VARIAVEL": "VAR",
    "TRUE_STORY": "CONST",
    "CONSTANTE": "CONST",
    "DERP": "IF",
    "SE": "IF",
    "I_LIED": "ELSE",
    "SENAO": "ELSE",
    "FOREVER_ALONE": "WHILE",
    "ENQUANTO": "WHILE",
    "CEREAL_GUY": "PRINT",
    "IMPRIMIR": "PRINT",
    "ASK_ME_ANYTHING": "READ",
    "LER": "READ",
    "NOT_BAD": "RETURN",
    "RETORNAR": "RETURN",
    "BREAK": "BREAK",
    "INTERROMPER": "BREAK",
    "OVER_9000": "TYPE_INT",
    "INTEIRO": "TYPE_INT",
    "ME_GUSTA": "TYPE_STRING",
    "TEXTO": "TYPE_STRING",
    "STRING": "TYPE_STRING",
    "FUCK_YEAH": "TYPE_BOOL",
    "BOOLEANO": "TYPE_BOOL",
    "VERDADEIRO": "TRUE",
    "TRUE": "TRUE",
    "NO_GUY": "FALSE",
    "FALSO": "FALSE",
    "FALSE": "FALSE",
}


class Lexer:
    def __init__(self, source: str):
        self.source = source
        self.i = 0
        self.line = 1
        self.column = 1

    def tokenize(self) -> list[Token]:
        tokens: list[Token] = []
        while self.i < len(self.source):
            ch = self.source[self.i]
            if ch in " \t\r":
                self._advance()
            elif ch == "\n":
                self._advance()
            elif ch == "/" and self._peek() == "/":
                self._skip_comment()
            elif ch.isdigit():
                tokens.append(self._number())
            elif ch == '"':
                tokens.append(self._string())
            elif ch.isalpha() or ch == "_":
                tokens.append(self._identifier())
            else:
                tokens.append(self._operator_or_delimiter())
        tokens.append(Token(TokenType.EOF, "", self.line, self.column))
        return tokens

    def _peek(self) -> str:
        return self.source[self.i + 1] if self.i + 1 < len(self.source) else ""

    def _advance(self) -> str:
        ch = self.source[self.i]
        self.i += 1
        if ch == "\n":
            self.line += 1
            self.column = 1
        else:
            self.column += 1
        return ch

    def _number(self) -> Token:
        line, col, start = self.line, self.column, self.i
        while self.i < len(self.source) and self.source[self.i].isdigit():
            self._advance()
        return Token(TokenType.INT, self.source[start:self.i], line, col)

    def _identifier(self) -> Token:
        line, col, start = self.line, self.column, self.i
        while self.i < len(self.source) and (self.source[self.i].isalnum() or self.source[self.i] == "_"):
            self._advance()
        lexeme = self.source[start:self.i]
        kind = KEYWORDS.get(lexeme, "IDENT")
        return Token(TokenType[kind], lexeme, line, col)

    def _string(self) -> Token:
        line, col = self.line, self.column
        self._advance()  # opening quote
        chars: list[str] = []
        while self.i < len(self.source) and self.source[self.i] != '"':
            if self.source[self.i] == "\n":
                raise LexicalError(f"linha {self.line}, coluna {self.column}: texto não pode quebrar linha")
            if self.source[self.i] == "\\":
                self._advance()
                if self.i >= len(self.source):
                    break
                escaped = self._advance()
                chars.append({"n": "\n", "t": "\t", '"': '"', "\\": "\\"}.get(escaped, escaped))
            else:
                chars.append(self._advance())
        if self.i >= len(self.source):
            raise LexicalError(f"linha {line}, coluna {col}: texto sem aspas de fechamento")
        self._advance()
        return Token(TokenType.STRING, "".join(chars), line, col)

    def _skip_comment(self) -> None:
        while self.i < len(self.source) and self.source[self.i] != "\n":
            self._advance()

    def _operator_or_delimiter(self) -> Token:
        line, col = self.line, self.column
        ch = self._advance()
        pairs = {"==": TokenType.EQ, "!=": TokenType.NE, ">=": TokenType.GE, "<=": TokenType.LE, "&&": TokenType.AND, "||": TokenType.OR}
        pair = ch + (self.source[self.i] if self.i < len(self.source) else "")
        if pair in pairs:
            self._advance()
            return Token(pairs[pair], pair, line, col)
        singles = {"+": TokenType.PLUS, "-": TokenType.MINUS, "*": TokenType.STAR, "/": TokenType.SLASH,
                   "=": TokenType.ASSIGN, ">": TokenType.GT, "<": TokenType.LT, "!": TokenType.NOT,
                   "(": TokenType.LPAREN, ")": TokenType.RPAREN, "{": TokenType.LBRACE, "}": TokenType.RBRACE,
                   ";": TokenType.SEMI, ",": TokenType.COMMA}
        if ch not in singles:
            raise LexicalError(f"linha {line}, coluna {col}: caractere inválido {ch!r}")
        return Token(singles[ch], ch, line, col)
