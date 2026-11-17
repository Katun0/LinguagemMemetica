from __future__ import annotations
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from ragelang.lexer import Lexer, LexicalError
from ragelang.parser import Parser, ParseError
from ragelang.compiler import SemanticAnalyzer, SemanticError, CSharpGenerator
from runner import Runner, ExecutionError

app = FastAPI(title='RageLang API', version='1.0.0')
origins = os.getenv('CORS_ORIGINS','http://localhost:5173,http://127.0.0.1:5173').split(',')
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=['GET','POST'], allow_headers=['Content-Type'])

class CodeRequest(BaseModel):
    source: str = Field(max_length=30000)
    inputs: str = Field(default='', max_length=4000)

@app.get('/api/health')
def health(): return {'status':'ok'}

@app.post('/api/compile')
def compile_code(request: CodeRequest):
    try:
        tokens = Lexer(request.source).tokenize()
        tree = Parser(tokens).parse()
        SemanticAnalyzer().analyze(tree)
        generated = CSharpGenerator().generate(tree)
        return {'ok': True, 'csharp': generated, 'tokens': len(tokens)-1, 'message':'Compilação realizada com sucesso.'}
    except (LexicalError, ParseError, SemanticError) as exc:
        return {'ok':False,'error':str(exc),'stage':'compile'}

@app.post('/api/run')
def run_code(request: CodeRequest):
    try:
        tokens = Lexer(request.source).tokenize()
        tree = Parser(tokens).parse()
        SemanticAnalyzer().analyze(tree)
        generated = CSharpGenerator().generate(tree)
        runner = Runner(request.inputs.splitlines())
        output = runner.run(tree)
        return {'ok':True,'csharp':generated,'output':output,'tokens':len(tokens)-1,'steps':runner.steps,'message':'Execução finalizada.'}
    except (LexicalError, ParseError, SemanticError, ExecutionError) as exc:
        return {'ok':False,'error':str(exc),'stage':'run'}
