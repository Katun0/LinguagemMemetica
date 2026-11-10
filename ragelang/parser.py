from __future__ import annotations
from dataclasses import dataclass
from typing import Any
from .lexer import Token, TokenType


class ParseError(Exception):
    pass


@dataclass
class Program:
    statements: list[Any]


@dataclass
class Block:
    statements: list[Any]


@dataclass
class VarDecl:
    name: str
    type_name: str
    initializer: Any
    constant: bool = False


@dataclass
class Assign:
    name: str
    value: Any


@dataclass
class Print:
    value: Any


@dataclass
class Read:
    name: str
    type_name: str | None = None  # anotado na análise semântica


@dataclass
class If:
    condition: Any
    then_branch: Block
    else_branch: Block | None


@dataclass
class While:
    condition: Any
    body: Block


@dataclass
class Break:
    pass


@dataclass
class Literal:
    value: Any
    type_name: str


@dataclass
class Variable:
    name: str


@dataclass
class Unary:
    operator: str
    operand: Any


@dataclass
class Binary:
    left: Any
    operator: str
    right: Any


TYPE_NAMES = {TokenType.TYPE_INT: "int", TokenType.TYPE_STRING: "string", TokenType.TYPE_BOOL: "bool"}


class Parser:
    def __init__(self, tokens: list[Token]):
        self.tokens = tokens
        self.i = 0

    def parse(self) -> Program:
        statements = []
        while not self._check(TokenType.EOF):
            if self._match(TokenType.SEMI):
                continue
            statements.append(self.statement())
        return Program(statements)

    def statement(self):
        if self._match(TokenType.VAR, TokenType.CONST):
            return self.declaration(self.tokens[self.i - 1].type == TokenType.CONST)
        if self._match(TokenType.PRINT):
            value = self._parenthesized_expression("CEREAL_GUY") if self._check(TokenType.LPAREN) else self.expression()
            self._consume(TokenType.SEMI, "esperado ';' depois da saída")
            return Print(value)
        if self._match(TokenType.READ):
            parenthesized = self._match(TokenType.LPAREN)
            name = self._consume(TokenType.IDENT, "esperado nome da variável para leitura").lexeme
            if parenthesized:
                self._consume(TokenType.RPAREN, "esperado ')' depois do nome")
            self._consume(TokenType.SEMI, "esperado ';' depois da leitura")
            return Read(name)
        if self._match(TokenType.IF):
            condition = self._parenthesized_expression("DERP")
            then_branch = self.block()
            else_branch = None
            if self._match(TokenType.ELSE):
                if self._match(TokenType.IF):
                    nested = self._if_after_keyword()
                    else_branch = Block([nested])
                else:
                    else_branch = self.block()
            return If(condition, then_branch, else_branch)
        if self._match(TokenType.WHILE):
            return While(self._parenthesized_expression("FOREVER_ALONE"), self.block())
        if self._match(TokenType.BREAK):
            self._consume(TokenType.SEMI, "esperado ';' depois de BREAK")
            return Break()
        if self._match(TokenType.RETURN):
            raise self._error(self.tokens[self.i - 1], "NOT_BAD/RETORNAR exige funções, ainda não implementadas nesta versão")
        if self._check(TokenType.IDENT):
            name = self._advance().lexeme
            self._consume(TokenType.ASSIGN, "esperado '=' na atribuição")
            value = self.expression()
            self._consume(TokenType.SEMI, "esperado ';' depois da atribuição")
            return Assign(name, value)
        token = self._peek()
        raise self._error(token, f"comando inesperado {token.lexeme or token.type.name}")

    def _if_after_keyword(self) -> If:
        condition = self._parenthesized_expression("DERP")
        then_branch = self.block()
        else_branch = None
        if self._match(TokenType.ELSE):
            if self._match(TokenType.IF):
                else_branch = Block([self._if_after_keyword()])
            else:
                else_branch = self.block()
        return If(condition, then_branch, else_branch)

    def declaration(self, constant: bool) -> VarDecl:
        if self._peek().type not in TYPE_NAMES:
            raise self._error(self._peek(), "esperado tipo OVER_9000, ME_GUSTA ou FUCK_YEAH")
        type_name = TYPE_NAMES[self._advance().type]
        name = self._consume(TokenType.IDENT, "esperado nome da variável").lexeme
        self._consume(TokenType.ASSIGN, "esperado '=' na declaração")
        initializer = self.expression()
        self._consume(TokenType.SEMI, "esperado ';' depois da declaração")
        return VarDecl(name, type_name, initializer, constant)

    def block(self) -> Block:
        self._consume(TokenType.LBRACE, "esperado '{' para iniciar bloco")
        statements = []
        while not self._check(TokenType.RBRACE, TokenType.EOF):
            if self._match(TokenType.SEMI):
                continue
            statements.append(self.statement())
        self._consume(TokenType.RBRACE, "esperado '}' para finalizar bloco")
        return Block(statements)

    def _parenthesized_expression(self, label: str):
        self._consume(TokenType.LPAREN, f"esperado '(' depois de {label}")
        value = self.expression()
        self._consume(TokenType.RPAREN, "esperado ')' depois da expressão")
        return value

    def expression(self): return self.or_expression()
    def or_expression(self):
        result = self.and_expression()
        while self._match(TokenType.OR): result = Binary(result, "||", self.and_expression())
        return result
    def and_expression(self):
        result = self.equality()
        while self._match(TokenType.AND): result = Binary(result, "&&", self.equality())
        return result
    def equality(self):
        result = self.comparison()
        while self._match(TokenType.EQ, TokenType.NE): result = Binary(result, self.tokens[self.i - 1].lexeme, self.comparison())
        return result
    def comparison(self):
        result = self.term()
        while self._match(TokenType.GT, TokenType.GE, TokenType.LT, TokenType.LE): result = Binary(result, self.tokens[self.i - 1].lexeme, self.term())
        return result
    def term(self):
        result = self.factor()
        while self._match(TokenType.PLUS, TokenType.MINUS): result = Binary(result, self.tokens[self.i - 1].lexeme, self.factor())
        return result
    def factor(self):
        result = self.unary()
        while self._match(TokenType.STAR, TokenType.SLASH): result = Binary(result, self.tokens[self.i - 1].lexeme, self.unary())
        return result
    def unary(self):
        if self._match(TokenType.NOT, TokenType.MINUS): return Unary(self.tokens[self.i - 1].lexeme, self.unary())
        return self.primary()
    def primary(self):
        if self._match(TokenType.INT): return Literal(int(self.tokens[self.i - 1].lexeme), "int")
        if self._match(TokenType.STRING): return Literal(self.tokens[self.i - 1].lexeme, "string")
        if self._match(TokenType.TRUE): return Literal(True, "bool")
        if self._match(TokenType.FALSE): return Literal(False, "bool")
        if self._match(TokenType.IDENT): return Variable(self.tokens[self.i - 1].lexeme)
        if self._match(TokenType.LPAREN):
            value = self.expression()
            self._consume(TokenType.RPAREN, "esperado ')' depois da expressão")
            return value
        raise self._error(self._peek(), "esperada expressão")

    def _match(self, *types):
        if self._check(*types):
            self._advance()
            return True
        return False
    def _check(self, *types): return self._peek().type in types
    def _advance(self):
        token = self.tokens[self.i]
        if token.type != TokenType.EOF: self.i += 1
        return token
    def _peek(self): return self.tokens[self.i]
    def _consume(self, kind, message):
        if self._check(kind): return self._advance()
        raise self._error(self._peek(), message)
    @staticmethod
    def _error(token, message):
        return ParseError(f"linha {token.line}, coluna {token.column}: {message}")
