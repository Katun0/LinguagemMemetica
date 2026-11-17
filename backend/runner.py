"""Interpretador didático e limitado da AST RageLang (sem executar C# nem shell)."""
from __future__ import annotations
from dataclasses import dataclass
from ragelang.parser import Program, VarDecl, Assign, Print, Read, If, While, Break, Literal, Variable, Unary, Binary, Block

class ExecutionError(Exception):
    pass

class BreakLoop(Exception):
    pass

@dataclass
class Cell:
    value: object
    kind: str
    constant: bool

class Runner:
    def __init__(self, inputs: list[str] | None = None, max_steps: int = 12000):
        self.scopes: list[dict[str, Cell]] = [{}]
        self.inputs = list(inputs or [])
        self.output: list[str] = []
        self.steps = 0
        self.max_steps = max_steps

    def tick(self):
        self.steps += 1
        if self.steps > self.max_steps:
            raise ExecutionError('Limite de execução atingido (possível laço infinito).')

    def lookup(self, name):
        for scope in reversed(self.scopes):
            if name in scope:
                return scope[name]
        raise ExecutionError(f'Variável {name} não encontrada')

    @staticmethod
    def int32(value):
        if not -(2**31) <= value <= 2**31-1:
            raise ExecutionError('Resultado fora do intervalo int32')
        return value

    def expr(self, n):
        self.tick()
        if isinstance(n, Literal): return n.value
        if isinstance(n, Variable): return self.lookup(n.name).value
        if isinstance(n, Unary):
            a = self.expr(n.operand)
            return (not a) if n.operator == '!' else self.int32(-a)
        if isinstance(n, Binary):
            a = self.expr(n.left)
            if n.operator == '&&': return bool(a) and bool(self.expr(n.right))
            if n.operator == '||': return bool(a) or bool(self.expr(n.right))
            b = self.expr(n.right)
            if n.operator == '+': return a + b if isinstance(a,str) else self.int32(a+b)
            if n.operator == '-': return self.int32(a-b)
            if n.operator == '*': return self.int32(a*b)
            if n.operator == '/':
                if b == 0: raise ExecutionError('Divisão por zero')
                return self.int32(int(a/b))
            if n.operator == '==': return a == b
            if n.operator == '!=': return a != b
            if n.operator == '>': return a > b
            if n.operator == '>=': return a >= b
            if n.operator == '<': return a < b
            if n.operator == '<=': return a <= b
        raise ExecutionError('Expressão não suportada')

    def block(self, b: Block):
        self.scopes.append({})
        try:
            for s in b.statements: self.statement(s)
        finally:
            self.scopes.pop()

    def statement(self, n):
        self.tick()
        if isinstance(n, VarDecl):
            self.scopes[-1][n.name] = Cell(self.expr(n.initializer),n.type_name,n.constant)
        elif isinstance(n, Assign):
            self.lookup(n.name).value = self.expr(n.value)
        elif isinstance(n, Print):
            v = self.expr(n.value)
            self.output.append(('true' if v else 'false') if isinstance(v,bool) else str(v))
            if sum(len(x) for x in self.output) > 16000: raise ExecutionError('Limite de saída atingido')
        elif isinstance(n, Read):
            if not self.inputs: raise ExecutionError(f'Entrada ausente para {n.name}. Preencha o campo Entrada.')
            text = self.inputs.pop(0)
            cell = self.lookup(n.name)
            try:
                if cell.kind == 'int': val = self.int32(int(text))
                elif cell.kind == 'bool':
                    if text.strip().lower() not in ('true','false'): raise ValueError()
                    val = text.strip().lower() == 'true'
                else: val = text
            except ValueError: raise ExecutionError(f'Entrada inválida para {n.name} ({cell.kind})')
            cell.value = val
        elif isinstance(n, If):
            if self.expr(n.condition): self.block(n.then_branch)
            elif n.else_branch: self.block(n.else_branch)
        elif isinstance(n, While):
            while True:
                self.tick()
                if not self.expr(n.condition): break
                try: self.block(n.body)
                except BreakLoop: break
        elif isinstance(n, Break): raise BreakLoop()
        else: raise ExecutionError('Instrução desconhecida')

    def run(self, program: Program):
        for n in program.statements: self.statement(n)
        return '\n'.join(self.output)
