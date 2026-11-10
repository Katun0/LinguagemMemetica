from __future__ import annotations
from dataclasses import dataclass
from .parser import (
    Program, Block, VarDecl, Assign, Print, Read, If, While, Break,
    Literal, Variable, Unary, Binary, Parser,
)
from .lexer import Lexer


class SemanticError(Exception):
    pass


@dataclass(frozen=True)
class Symbol:
    type_name: str
    constant: bool


class SemanticAnalyzer:
    def __init__(self):
        self.scopes: list[dict[str, Symbol]] = [{}]
        self.loop_depth = 0

    def analyze(self, program: Program) -> None:
        for node in program.statements:
            self.statement(node)

    def lookup(self, name: str) -> Symbol:
        for scope in reversed(self.scopes):
            if name in scope:
                return scope[name]
        raise SemanticError(f"variável '{name}' não declarada ou fora de escopo")

    def statement(self, node) -> None:
        if isinstance(node, VarDecl):
            # C# não permite ocultar um local externo com outro de mesmo nome.
            if any(node.name in scope for scope in self.scopes):
                raise SemanticError(f"variável '{node.name}' já foi declarada neste escopo ou em escopo externo")
            actual = self.expr(node.initializer)
            self.require_compatible(node.type_name, actual, f"inicialização de '{node.name}'")
            if node.constant and not self.is_constant_expr(node.initializer):
                raise SemanticError(f"constante '{node.name}' exige inicializador constante")
            self.scopes[-1][node.name] = Symbol(node.type_name, node.constant)
        elif isinstance(node, Assign):
            symbol = self.lookup(node.name)
            if symbol.constant:
                raise SemanticError(f"constante '{node.name}' não pode ser reatribuída")
            self.require_compatible(symbol.type_name, self.expr(node.value), f"atribuição para '{node.name}'")
        elif isinstance(node, Print):
            self.expr(node.value)
        elif isinstance(node, Read):
            symbol = self.lookup(node.name)
            if symbol.constant:
                raise SemanticError(f"não é possível ler dados para a constante '{node.name}'")
            node.type_name = symbol.type_name
        elif isinstance(node, If):
            if self.expr(node.condition) != "bool":
                raise SemanticError("a condição do DERP deve ser booleana")
            self.block(node.then_branch)
            if node.else_branch is not None:
                self.block(node.else_branch)
        elif isinstance(node, While):
            if self.expr(node.condition) != "bool":
                raise SemanticError("a condição do FOREVER_ALONE deve ser booleana")
            self.loop_depth += 1
            try:
                self.block(node.body)
            finally:
                self.loop_depth -= 1
        elif isinstance(node, Break):
            if self.loop_depth == 0:
                raise SemanticError("BREAK só pode aparecer dentro de um FOREVER_ALONE")
        else:
            raise SemanticError(f"instrução desconhecida: {type(node).__name__}")

    def block(self, node: Block) -> None:
        self.scopes.append({})
        try:
            for stmt in node.statements:
                self.statement(stmt)
        finally:
            self.scopes.pop()

    def is_constant_expr(self, node) -> bool:
        if isinstance(node, Literal):
            return True
        if isinstance(node, Variable):
            return self.lookup(node.name).constant
        if isinstance(node, Unary):
            return self.is_constant_expr(node.operand)
        if isinstance(node, Binary):
            return self.is_constant_expr(node.left) and self.is_constant_expr(node.right)
        return False

    def expr(self, node) -> str:
        if isinstance(node, Literal):
            return node.type_name
        if isinstance(node, Variable):
            return self.lookup(node.name).type_name
        if isinstance(node, Unary):
            operand = self.expr(node.operand)
            if node.operator == "!":
                if operand != "bool":
                    raise SemanticError("'!' exige booleano")
                return "bool"
            if node.operator == "-":
                if operand != "int":
                    raise SemanticError("'-' exige inteiro")
                return "int"
        if isinstance(node, Binary):
            left, right = self.expr(node.left), self.expr(node.right)
            if node.operator in {"+", "-", "*", "/"}:
                if node.operator == "+" and left == right == "string":
                    return "string"
                if left != "int" or right != "int":
                    raise SemanticError(f"operação '{node.operator}' exige inteiros (ou '+' entre strings)")
                return "int"
            if node.operator in {">", ">=", "<", "<="}:
                if left != right or left not in {"int", "string"}:
                    raise SemanticError(f"comparação '{node.operator}' exige tipos iguais int ou string")
                # C# não permite operadores relacionais entre strings.
                if left == "string":
                    raise SemanticError(f"comparação '{node.operator}' entre strings não é suportada")
                return "bool"
            if node.operator in {"==", "!="}:
                if left != right:
                    raise SemanticError("igualdade exige valores do mesmo tipo")
                return "bool"
            if node.operator in {"&&", "||"}:
                if left != "bool" or right != "bool":
                    raise SemanticError(f"operador lógico '{node.operator}' exige booleanos")
                return "bool"
        raise SemanticError("expressão inválida")

    @staticmethod
    def require_compatible(expected: str, actual: str, context: str) -> None:
        if expected != actual:
            raise SemanticError(f"tipo incompatível em {context}: esperado {expected}, recebido {actual}")


# Identificadores que coincidem com palavras reservadas do C# recebem @.
CSHARP_KEYWORDS = set('''abstract as base bool break byte case catch char checked class const continue decimal
 default delegate do double else enum event explicit extern false finally fixed float for foreach goto if
 implicit in int interface internal is lock long namespace new null object operator out override params
 private protected public readonly ref return sbyte sealed short sizeof stackalloc static string struct
 switch this throw true try typeof uint ulong unchecked unsafe ushort using virtual void volatile while
 add alias and args ascending async await by descending dynamic equals file from get global group init
 into join let managed nameof nint not notnull nuint on or orderby partial record remove required scoped
 select set unmanaged value var when where with yield'''.split())


def cs_name(name: str) -> str:
    return "@" + name if name in CSHARP_KEYWORDS else name


class CSharpGenerator:
    def __init__(self):
        self.lines: list[str] = []
        self.level = 0

    def generate(self, program: Program) -> str:
        self.lines = ["using System;", "", "class Program", "{", "    static void Main()", "    {"]
        self.level = 2
        for stmt in program.statements:
            self.statement(stmt)
        self.level = 1
        self.emit("}")
        self.lines.append("}")
        return "\n".join(self.lines) + "\n"

    def emit(self, value: str) -> None:
        self.lines.append("    " * self.level + value)

    def statement(self, node) -> None:
        if isinstance(node, VarDecl):
            modifier = "const " if node.constant else ""
            self.emit(f"{modifier}{node.type_name} {cs_name(node.name)} = {self.expr(node.initializer)};")
        elif isinstance(node, Assign):
            self.emit(f"{cs_name(node.name)} = {self.expr(node.value)};")
        elif isinstance(node, Print):
            self.emit(f"Console.WriteLine({self.expr(node.value)});")
        elif isinstance(node, Read):
            if node.type_name is None:
                raise ValueError("leitura sem análise semântica")
            raw = "Console.ReadLine() ?? \"\""
            conversion = {"string": raw, "int": f"int.Parse({raw})", "bool": f"bool.Parse({raw})"}[node.type_name]
            self.emit(f"{cs_name(node.name)} = {conversion};")
        elif isinstance(node, If):
            self.emit(f"if ({self.expr(node.condition)})")
            self.block(node.then_branch)
            if node.else_branch is not None:
                self.emit("else")
                self.block(node.else_branch)
        elif isinstance(node, While):
            self.emit(f"while ({self.expr(node.condition)})")
            self.block(node.body)
        elif isinstance(node, Break):
            self.emit("break;")
        else:
            raise ValueError(f"instrução desconhecida: {type(node).__name__}")

    def block(self, node: Block) -> None:
        self.emit("{")
        self.level += 1
        for stmt in node.statements:
            self.statement(stmt)
        self.level -= 1
        self.emit("}")

    def expr(self, node) -> str:
        if isinstance(node, Literal):
            if node.type_name == "string":
                escaped = (node.value.replace("\\", "\\\\").replace('"', '\\"')
                           .replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t")
                           .replace("\0", "\\0"))
                return f'"{escaped}"'
            if node.type_name == "bool":
                return "true" if node.value else "false"
            return str(node.value)
        if isinstance(node, Variable):
            return cs_name(node.name)
        if isinstance(node, Unary):
            return f"({node.operator}{self.expr(node.operand)})"
        if isinstance(node, Binary):
            return f"({self.expr(node.left)} {node.operator} {self.expr(node.right)})"
        raise ValueError(f"expressão desconhecida: {type(node).__name__}")


def compile_source(source: str) -> str:
    tree = Parser(Lexer(source).tokenize()).parse()
    SemanticAnalyzer().analyze(tree)
    return CSharpGenerator().generate(tree)
