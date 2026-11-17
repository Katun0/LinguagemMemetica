# RageLang Web — React + TypeScript + Python

Playground web para a linguagem memética RageLang. O compilador Python original foi mantido em `backend/ragelang/` (lexer, parser, análise semântica e gerador C#). A interface em React + TypeScript usa Monaco Editor, Material UI e Lucide.

DEPLOY: https://rage-lang-ojeb.vercel.app/

## Pré-requisitos
- Python 3.10+
- Node.js 20+

## 1) Backend (terminal 1)

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Linux/macOS:
# source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

API em http://localhost:8000 e documentação interativa em http://localhost:8000/docs.

## 2) Frontend (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Abra http://localhost:5173.

**Importante:** `npm install` exige conexão com o registro npm e não foi possível validar o build React neste ambiente. O backend Python, os exemplos e os 25 testes do compilador foram executados com sucesso.

## Funcionalidades
- Editor Monaco com destaque de sintaxe RageLang, linhas, Ctrl/Cmd+Enter
- Exemplos de programas (condicionais, laços, entrada de dados, erro semântico)
- Compilar → tokenização + parsing + semântica + geração C#
- Executar → interpretador educacional da AST, **não** compila/roda o C# no servidor
- Terminal mostrando saída, erros e C# gerado
- Copiar, baixar `.rage`, restaurar exemplo, documentação dos comandos
- Backend com limite de passos e tamanho de saída para reduzir risco de laços infinitos

## Testes Python

```bash
cd backend
python -m unittest discover -s tests -v
```

## Arquitetura

```text
frontend/                 React, Vite, TypeScript, Monaco, Material UI
  src/App.tsx             IDE, documentação e terminal web
  src/examples.ts         Exemplos e palavras-chave
  src/style.css           Layout responsivo
backend/
  main.py                 FastAPI /api/health /api/compile /api/run
  runner.py               Interpretador limitado da AST
  ragelang/               Código original de compilação RageLang → C#
  examples/               Exemplos da versão anterior
  tests/                  Testes originais
  GRAMATICA.ebnf          Gramática
```

## Publicação

### Backend (Render/Railway/Fly.io)

Configure diretório raiz `backend`, runtime Python, instalação `pip install -r requirements.txt` e inicialização:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Configure `CORS_ORIGINS=https://SEU-SITE.vercel.app` (separar múltiplas origens por vírgulas).

### Frontend (Vercel)

Configure diretório raiz `frontend`, comando de build `npm run build`, saída `dist` e variável:

```env
VITE_API_URL=https://SEU-BACKEND.onrender.com
```

Em desenvolvimento o Vite faz proxy de `/api` para `localhost:8000`, então não precisa de `.env`.

## Atenção para publicar
Este é um ambiente educacional. O runner possui limitação de passos, código e saída, mas **não é um sandbox de segurança de nível de produção**: para tráfego público, adicione rate limiting, isolamento por processo/container, limites de CPU/memória e monitoramento. Nunca execute C# gerado por usuários diretamente no servidor. A versão da linguagem ainda não implementa funções/retornos, listas ou `for`.

## Edição Rage Comics / visual retrô

O frontend foi redesenhado com estética de quadrinhos de 2008–2012: papel quadriculado, bordas pretas espessas, amarelo/vermelho, cards inclinados e ilustrações SVG originais em `frontend/public/memes/`.

**Execução local:**

```bash
# terminal 1
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

```bash
# terminal 2, na raiz do projeto
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`. Se necessário, crie `frontend/.env` com `VITE_API_URL=http://localhost:8000`.

- O editor Monaco e as rotas `/api/compile`, `/api/run` e `/api/health` foram mantidos.
- Os rostos são **ilustrações vetoriais originais inspiradas na estética Rage Comics**, não cópias oficiais de memes históricos.
- Para adicionar ou trocar rostos, edite os SVGs em `frontend/public/memes/` e os componentes `Face`/`MemeGallery`.
- O build do frontend depende da instalação dos pacotes npm; neste ambiente a instalação não concluiu (restrição de rede), mas a sintaxe TSX foi verificada. Os 25 testes Python passaram.
