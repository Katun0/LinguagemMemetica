from __future__ import annotations

from dataclasses import dataclass
from .parser import *


class SemanticError(Exception):
    pass


@dataclass
class Symbol:
    type_name: str
    constant: bool


class SemanticAnalyzer:
    def __init__(self):
        self.symbols: dict[str, Symbol] = {}
        self.loop_depth = 0

    def analyze(self, program: Program) -> None:
        for statement in program.statements:
            self.statement(statement)

    def statement(self, node):
        if isinstance(node, VarDecl):
            if node.name in self.symbols: raise SemanticError(f"variável '{node.name}' já foi declarada")
            actual = self.expr(node.initializer)
            self.require_compatible(node.type_name, actual, f"inicialização de '{node.name}'")
            self.symbols[node.name] = Symbol(node.type_name, node.constant)
        elif isinstance(node, Assign):
            symbol = self.symbols.get(node.name)
            if symbol is None: raise SemanticError(f"variável '{node.name}' não declarada")
            if symbol.constant: raise SemanticError(f"constante '{node.name}' não pode ser reatribuída")
            self.require_compatible(symbol.type_name, self.expr(node.value), f"atribuição para '{node.name}'")
        elif isinstance(node, Print): self.expr(node.value)
        elif isinstance(node, Read):
            if node.name not in self.symbols: raise SemanticError(f"variável '{node.name}' não declarada")
        elif isinstance(node, If):
            if self.expr(node.condition) != "bool": raise SemanticError("a condição do DERP deve ser booleana")
            self.block(node.then_branch)
            if node.else_branch: self.block(node.else_branch)
        elif isinstance(node, While):
            if self.expr(node.condition) != "bool": raise SemanticError("a condição do FOREVER_ALONE deve ser booleana")
            self.loop_depth += 1; self.block(node.body); self.loop_depth -= 1
        elif isinstance(node, Break) and self.loop_depth == 0:
            raise SemanticError("BREAK só pode aparecer dentro de um FOREVER_ALONE")

    def block(self, node):
        for statement in node.statements: self.statement(statement)

    def expr(self, node) -> str:
        if isinstance(node, Literal): return node.type_name
        if isinstance(node, Variable):
            if node.name not in self.symbols: raise SemanticError(f"variável '{node.name}' não declarada")
            return self.symbols[node.name].type_name
        if isinstance(node, Unary):
            actual = self.expr(node.operand)
            if node.operator == "!" and actual != "bool": raise SemanticError("'!' exige uma expressão booleana")
            if node.operator == "-" and actual != "int": raise SemanticError("sinal '-' exige um inteiro")
            return actual
        if isinstance(node, Binary):
            left, right = self.expr(node.left), self.expr(node.right)
            if node.operator in {"+", "-", "*", "/"}:
                if node.operator == "+" and left == right == "string": return "string"
                if left != right or left != "int": raise SemanticError(f"operação '{node.operator}' exige inteiros (ou '+' entre textos)")
                return "int"
            if node.operator in {">", ">=", "<", "<="}:
                if left != right or left not in {"int", "string"}: raise SemanticError(f"comparação '{node.operator}' exige dois valores compatíveis")
                return "bool"
            if node.operator in {"==", "!="}:
                if left != right: raise SemanticError("igualdade exige valores do mesmo tipo")
                return "bool"
            if node.operator in {"&&", "||"}:
                if left != right or left != "bool": raise SemanticError(f"operação lógica '{node.operator}' exige booleanos")
                return "bool"
        raise SemanticError("expressão inválida")

    @staticmethod
    def require_compatible(expected, actual, context):
        if expected != actual: raise SemanticError(f"tipo incompatível em {context}: esperado {expected}, recebido {actual}")


class CSharpGenerator:
    def __init__(self): self.lines: list[str] = []; self.level = 0
    def generate(self, program: Program) -> str:
        self.lines = ["using System;", "", "class Program", "{", "    static void Main()", "    {"]
        self.level = 2
        for statement in program.statements: self.statement(statement)
        self.level = 1; self.emit("}"); self.lines.append("}")
        return "\n".join(self.lines) + "\n"
    def emit(self, text): self.lines.append("    " * self.level + text)
    def statement(self, node):
        if isinstance(node, VarDecl):
            prefix = "const " if node.constant else ""
            self.emit(f"{prefix}{self.cs_type(node.type_name)} {node.name} = {self.expr(node.initializer)};")
        elif isinstance(node, Assign): self.emit(f"{node.name} = {self.expr(node.value)};")
        elif isinstance(node, Print): self.emit(f"Console.WriteLine({self.expr(node.value)});")
        elif isinstance(node, Read): self.emit(f"{node.name} = {self.read_expr(node.name)};")
        elif isinstance(node, If):
            self.emit(f"if ({self.expr(node.condition)})"); self.block(node.then_branch)
            if node.else_branch: self.emit("else"); self.block(node.else_branch)
        elif isinstance(node, While):
            self.emit(f"while ({self.expr(node.condition)})"); self.block(node.body)
        elif isinstance(node, Break): self.emit("break;")
    def block(self, node):
        self.emit("{"); self.level += 1
        for statement in node.statements: self.statement(statement)
        self.level -= 1; self.emit("}")
    def expr(self, node):
        if isinstance(node, Literal):
            if node.type_name == "string": return '"' + node.value.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n') + '"'
            if node.type_name == "bool": return "true" if node.value else "false"
            return str(node.value)
        if isinstance(node, Variable): return node.name
        if isinstance(node, Unary): return f"({node.operator}{self.expr(node.operand)})"
        if isinstance(node, Binary): return f"({self.expr(node.left)} {node.operator} {self.expr(node.right)})"
        raise ValueError("expressão não suportada")
    @staticmethod
    def cs_type(type_name): return {"int": "int", "string": "string", "bool": "bool"}[type_name]
    def read_expr(self, name):
        # O tipo foi verificado pelo analisador; o gerador consulta os usos conhecidos.
        type_name = getattr(self, "types", {}).get(name, "string")
        if type_name == "string": return "Console.ReadLine()"
        if type_name == "bool": return "bool.Parse(Console.ReadLine())"
        return "int.Parse(Console.ReadLine())"


def compile_source(source: str) -> str:
    from .lexer import Lexer
    tokens = Lexer(source).tokenize()
    tree = Parser(tokens).parse()
    analyzer = SemanticAnalyzer(); analyzer.analyze(tree)
    generator = CSharpGenerator(); generator.types = {name: symbol.type_name for name, symbol in analyzer.symbols.items()}
    return generator.generate(tree)
