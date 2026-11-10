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
    RETURN = auto()  # reservado para a futura implementação de funções
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
    "POKER_FACE": TokenType.VAR, "VARIAVEL": TokenType.VAR,
    "TRUE_STORY": TokenType.CONST, "CONSTANTE": TokenType.CONST,
    "DERP": TokenType.IF, "SE": TokenType.IF,
    "I_LIED": TokenType.ELSE, "SENAO": TokenType.ELSE,
    "FOREVER_ALONE": TokenType.WHILE, "ENQUANTO": TokenType.WHILE,
    "CEREAL_GUY": TokenType.PRINT, "IMPRIMIR": TokenType.PRINT,
    "ASK_ME_ANYTHING": TokenType.READ, "LER": TokenType.READ,
    "NOT_BAD": TokenType.RETURN, "RETORNAR": TokenType.RETURN,
    "BREAK": TokenType.BREAK, "INTERROMPER": TokenType.BREAK,
    "OVER_9000": TokenType.TYPE_INT, "INTEIRO": TokenType.TYPE_INT,
    "ME_GUSTA": TokenType.TYPE_STRING, "TEXTO": TokenType.TYPE_STRING, "STRING": TokenType.TYPE_STRING,
    "FUCK_YEAH": TokenType.TYPE_BOOL, "BOOLEANO": TokenType.TYPE_BOOL,
    "VERDADEIRO": TokenType.TRUE, "TRUE": TokenType.TRUE,
    "NO_GUY": TokenType.FALSE, "FALSO": TokenType.FALSE, "FALSE": TokenType.FALSE,
}


class Lexer:
    def __init__(self, source: str):
        self.source = source
        self.i = 0
        self.line = 1
        self.column = 1

    def tokenize(self) -> list[Token]:
        result = []
        while self.i < len(self.source):
            ch = self.source[self.i]
            if ch.isspace():
                self._advance()
            elif ch == "/" and self._peek() == "/":
                while self.i < len(self.source) and self.source[self.i] != "\n":
                    self._advance()
            elif ch.isdigit():
                result.append(self._number())
            elif ch == '"':
                result.append(self._string())
            elif ch.isalpha() or ch == "_":
                result.append(self._identifier())
            else:
                result.append(self._operator())
        result.append(Token(TokenType.EOF, "", self.line, self.column))
        return result

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
        if self.i < len(self.source) and (self.source[self.i].isalpha() or self.source[self.i] == "_"):
            raise LexicalError(f"linha {line}, coluna {col}: número seguido de identificador")
        return Token(TokenType.INT, self.source[start:self.i], line, col)

    def _identifier(self) -> Token:
        line, col, start = self.line, self.column, self.i
        while self.i < len(self.source) and (self.source[self.i].isalnum() or self.source[self.i] == "_"):
            self._advance()
        word = self.source[start:self.i]
        return Token(KEYWORDS.get(word, TokenType.IDENT), word, line, col)

    def _string(self) -> Token:
        line, col = self.line, self.column
        self._advance()
        chars = []
        escapes = {"n": "\n", "t": "\t", "r": "\r", '"': '"', "\\": "\\"}
        while self.i < len(self.source) and self.source[self.i] != '"':
            if self.source[self.i] == "\n":
                raise LexicalError(f"linha {self.line}, coluna {self.column}: string não pode quebrar linha")
            if self.source[self.i] == "\\":
                self._advance()
                if self.i >= len(self.source):
                    raise LexicalError(f"linha {line}, coluna {col}: string não terminada")
                escape = self._advance()
                if escape not in escapes:
                    raise LexicalError(f"linha {self.line}, coluna {self.column - 1}: escape inválido \\{escape}")
                chars.append(escapes[escape])
            else:
                chars.append(self._advance())
        if self.i >= len(self.source):
            raise LexicalError(f"linha {line}, coluna {col}: string sem aspas de fechamento")
        self._advance()
        return Token(TokenType.STRING, "".join(chars), line, col)

    def _operator(self) -> Token:
        line, col = self.line, self.column
        ch = self._advance()
        pair = ch + (self.source[self.i] if self.i < len(self.source) else "")
        pairs = {"==": TokenType.EQ, "!=": TokenType.NE, ">=": TokenType.GE, "<=": TokenType.LE,
                 "&&": TokenType.AND, "||": TokenType.OR}
        if pair in pairs:
            self._advance()
            return Token(pairs[pair], pair, line, col)
        singles = {"+": TokenType.PLUS, "-": TokenType.MINUS, "*": TokenType.STAR,
                   "/": TokenType.SLASH, "=": TokenType.ASSIGN, ">": TokenType.GT,
                   "<": TokenType.LT, "!": TokenType.NOT, "(": TokenType.LPAREN,
                   ")": TokenType.RPAREN, "{": TokenType.LBRACE, "}": TokenType.RBRACE,
                   ";": TokenType.SEMI, ",": TokenType.COMMA}
        if ch not in singles:
            raise LexicalError(f"linha {line}, coluna {col}: caractere inválido {ch!r}")
        return Token(singles[ch], ch, line, col)
