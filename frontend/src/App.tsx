import { useEffect, useMemo, useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  Tooltip,
} from "@mui/material";
import {
  ArrowRight,
  BookOpen,
  Braces,
  Check,
  ChevronDown,
  CircleAlert,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  Layers,
  Menu,
  Play,
  RotateCcw,
  Sparkles,
  SquareTerminal,
  Terminal,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import { examples, keywords, type ExampleKey } from "./examples";

type Result = {
  ok: boolean;
  csharp?: string;
  output?: string;
  tokens?: number;
  steps?: number;
  message?: string;
  error?: string;
  stage?: string;
};
type Log = { type: "info" | "success" | "error" | "output"; content: string };
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#ad8aff" },
    background: { default: "#090c13", paper: "#111622" },
  },
  typography: { fontFamily: "DM Sans, sans-serif" },
  shape: { borderRadius: 12 },
});
const API = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

function Logo() {
  return (
    <div className="brand">
      <div className="brandicon">
        R<span>!</span>
      </div>
      <span>
        rage<span className="brandlight">lang</span>
        <span className="brandperiod">.</span>
      </span>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<"playground" | "docs" | "about">("playground");
  const [active, setActive] = useState<ExampleKey>("poder");
  const [source, setSource] = useState<string>(examples.poder.code);
  const [inputs, setInputs] = useState("");
  const [mode, setMode] = useState<"console" | "csharp">("console");
  const [result, setResult] = useState<Result | null>(null);
  const [logs, setLogs] = useState<Log[]>([
    { type: "info", content: "RageLang Terminal v1.0.0" },
    {
      type: "info",
      content: "Pronto para compilar. Pressione ▶ Executar ou Ctrl+Enter.",
    },
  ]);
  const [busy, setBusy] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [service, setService] = useState<"checking" | "online" | "offline">(
    "checking",
  );
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    fetch(`${API}/api/health`)
      .then((r) => {
        if (!r.ok) throw Error();
        setService("online");
      })
      .catch(() => setService("offline"));
  }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [logs]);
  function selectExample(key: ExampleKey) {
    setActive(key);
    setSource(examples[key].code);
    setResult(null);
    setSidebar(false);
    setTab("playground");
    setLogs([
      { type: "info", content: `Exemplo carregado: ${examples[key].name}` },
      {
        type: "info",
        content: "Clique em Compilar ou Executar para continuar.",
      },
    ]);
  }
  async function submit(action: "compile" | "run") {
    if (busy) return;
    setBusy(true);
    setMode("console");
    setLogs([
      {
        type: "info",
        content: `$ ragelang ${action === "compile" ? "--compile" : "--run"} main.rage`,
      },
      { type: "info", content: "Analisando tokens, sintaxe e semântica..." },
    ]);
    try {
      const resp = await fetch(`${API}/api/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, inputs }),
      });
      if (!resp.ok) throw Error(`Servidor retornou HTTP ${resp.status}`);
      const data: Result = await resp.json();
      setResult(data);
      if (!data.ok) {
        setLogs((prev) => [
          ...prev,
          {
            type: "error",
            content: `ERRO: ${data.error || "Falha desconhecida"}`,
          },
        ]);
        return;
      }
      setLogs((prev) => [
        ...prev,
        {
          type: "success",
          content: `✓ Análise concluída · ${data.tokens || 0} tokens`,
        },
        { type: "success", content: "✓ C# gerado com sucesso" },
        ...(action === "run"
          ? [
              { type: "info" as const, content: "── Saída do programa ──" },
              {
                type: "output" as const,
                content: data.output || "(Nenhuma saída)",
              },
              {
                type: "success" as const,
                content: `Processo finalizado · ${data.steps || 0} passos`,
              },
            ]
          : [
              {
                type: "info" as const,
                content: "Abra a aba Código C# para ver o resultado.",
              },
            ]),
      ]);
      if (action === "compile") setMode("csharp");
    } catch (err) {
      setLogs((prev) => [
        ...prev,
        {
          type: "error",
          content: `Falha de conexão: ${err instanceof Error ? err.message : String(err)}. Inicie o backend Python na porta 8000.`,
        },
      ]);
      setService("offline");
    } finally {
      setBusy(false);
    }
  }
  const lines = useMemo(() => source.split("\n").length, [source]);
  function handleEditorMount(
    editor: Parameters<OnMount>[0],
    monaco: Parameters<OnMount>[1],
  ) {
    editorRef.current = editor;
    if (
      !monaco.languages
        .getLanguages()
        .some((x: { id: string }) => x.id === "ragelang")
    ) {
      monaco.languages.register({ id: "ragelang" });
      monaco.languages.setMonarchTokensProvider("ragelang", {
        tokenizer: {
          root: [
            [/\/\/.*$/, "comment"],
            [/"([^"\\]|\\.)*"/, "string"],
            [
              /\b(?:POKER_FACE|VARIAVEL|TRUE_STORY|CONSTANTE|DERP|SE|I_LIED|SENAO|FOREVER_ALONE|ENQUANTO|CEREAL_GUY|IMPRIMIR|ASK_ME_ANYTHING|LER|BREAK|INTERROMPER)\b/,
              "keyword",
            ],
            [
              /\b(?:OVER_9000|INTEIRO|ME_GUSTA|TEXTO|STRING|FUCK_YEAH|BOOLEANO)\b/,
              "type",
            ],
            [/\b(?:VERDADEIRO|TRUE|NO_GUY|FALSO|FALSE)\b/, "constant"],
            [/\b\d+\b/, "number"],
            [/[{}()]/, "delimiter.bracket"],
            [/[=!<>+*/&|\-]+/, "operator"],
            [/[a-zA-Z_][\w]*/, "identifier"],
          ],
        },
      });
      monaco.editor.defineTheme("rage", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "keyword", foreground: "C59AFF", fontStyle: "bold" },
          { token: "type", foreground: "5ECCD6" },
          { token: "constant", foreground: "F7B96A" },
          { token: "string", foreground: "A1DAA1" },
          { token: "comment", foreground: "627088", fontStyle: "italic" },
          { token: "number", foreground: "F1B176" },
          { token: "operator", foreground: "D2D8E3" },
        ],
        colors: {
          "editor.background": "#101521",
          "editor.foreground": "#DCE4F3",
          "editorLineNumber.foreground": "#48536A",
          "editorLineNumber.activeForeground": "#A0ACBF",
          "editor.selectionBackground": "#7455C755",
          "editor.lineHighlightBackground": "#ffffff05",
          "editorCursor.foreground": "#B99AFF",
          "editorIndentGuide.background1": "#283040",
        },
      });
    }
    monaco.editor.setTheme("rage");
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      document.getElementById("run-button")?.click();
    });
  }
  const apiReady = service !== "offline";
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <header className="topbar">
          <div className="topbarinner">
            <Logo />
            <nav className="mainnav">
              <button
                className={tab === "playground" ? "navactive" : ""}
                onClick={() => setTab("playground")}
              >
                <SquareTerminal size={16} /> Playground
              </button>
              <button
                className={tab === "docs" ? "navactive" : ""}
                onClick={() => setTab("docs")}
              >
                <BookOpen size={16} /> Documentação
              </button>
              <button
                className={tab === "about" ? "navactive" : ""}
                onClick={() => setTab("about")}
              >
                <Layers size={16} /> Sobre o projeto
              </button>
            </nav>
            <div className="headerright">
              <div className="release">
                <span className="releaselight" /> v1.0.0
              </div>
              <button
                className="mobiletoggle"
                onClick={() => setMobileMenu(!mobileMenu)}
                aria-label="Menu"
              >
                <Menu size={21} />
              </button>
            </div>
          </div>
          {mobileMenu && (
            <div className="mobilemenu">
              <button
                onClick={() => {
                  setTab("playground");
                  setMobileMenu(false);
                }}
              >
                Playground
              </button>
              <button
                onClick={() => {
                  setTab("docs");
                  setMobileMenu(false);
                }}
              >
                Documentação
              </button>
              <button
                onClick={() => {
                  setTab("about");
                  setMobileMenu(false);
                }}
              >
                Sobre o projeto
              </button>
            </div>
          )}
        </header>
        <main className="main">
          <div className="hero">
            <div className="eyebrow">
              <Sparkles size={14} /> A LINGUAGEM MAIS MEMÉTICA DA INTERNET{" "}
              <span className="eyeline" />
            </div>
            <h1>
              Code like a <span>meme.</span>
              <br />
              Compile like a <span className="gradienttext">legend.</span>
            </h1>
            <p>
              Aprenda, escreva e execute RageLang direto do navegador. Onde os
              memes viram código e as ideias viram realidade.
            </p>
            <div className="heroactions">
              <button
                className="primarybtn"
                onClick={() => {
                  setTab("playground");
                  document
                    .getElementById("workspace")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Zap size={17} fill="currentColor" /> Começar a programar{" "}
                <ArrowRight size={17} />
              </button>
              <button className="ghostbtn" onClick={() => setTab("docs")}>
                <BookOpen size={17} /> Ver documentação
              </button>
            </div>
            <div className="herochips">
              <span>
                <Check size={14} /> Compilador real em Python
              </span>
              <span>
                <Check size={14} /> Transpilação para C#
              </span>
              <span>
                <Check size={14} /> Grátis e open source
              </span>
            </div>
          </div>
          {tab === "playground" ? (
            <section id="workspace" className="workspace">
              <div className="sectionheading">
                <div>
                  <div className="sectioneyebrow">
                    <span className="liveicon" /> LIVE PLAYGROUND
                  </div>
                  <h2>
                    Seu laboratório de memes<span>.</span>
                  </h2>
                  <p>
                    Experimente exemplos, escreva seu código e veja a mágica
                    acontecer.
                  </p>
                </div>
                <div className={`status ${service}`}>
                  <span className="statusdot" />
                  {service === "online"
                    ? "Compilador online"
                    : service === "offline"
                      ? "Backend desconectado"
                      : "Conectando..."}
                </div>
              </div>
              <div className="ide">
                <aside className={`filespanel ${sidebar ? "open" : ""}`}>
                  <div className="paneltitle">
                    <span>
                      <Layers size={16} /> EXPLORADOR
                    </span>
                    <button
                      className="closemobile"
                      onClick={() => setSidebar(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="foldertitle">
                    <ChevronDown size={15} /> <span>EXEMPLOS</span>
                  </div>
                  <div className="filelist">
                    {(Object.keys(examples) as ExampleKey[]).map((k) => (
                      <button
                        key={k}
                        className={`fileitem ${active === k ? "selected" : ""}`}
                        onClick={() => selectExample(k)}
                      >
                        <FileCode2 size={15} /> <span>{k}.rage</span>
                        {active === k && <span className="filedot" />}
                      </button>
                    ))}
                  </div>
                  <div className="asidefoot">
                    <div className="asidefooticon">
                      <Code2 size={20} />
                    </div>
                    <strong>Aprenda fazendo</strong>
                    <p>
                      Explore os exemplos para descobrir como funciona cada
                      comando.
                    </p>
                    <button onClick={() => setTab("docs")}>
                      Ver referência <ArrowRight size={13} />
                    </button>
                  </div>
                </aside>
                <div className="workarea">
                  <div className="editorbar">
                    <div className="editorbartabs">
                      <button
                        className="showfiles"
                        onClick={() => setSidebar(true)}
                      >
                        <Menu size={16} />
                      </button>
                      <div className="editorfile">
                        <FileCode2 size={16} /> main.rage{" "}
                        <span className="editeddot" />
                      </div>
                    </div>
                    <div className="editoractions">
                      <Tooltip title="Restaurar exemplo">
                        <button
                          className="iconbtn"
                          onClick={() => setSource(examples[active].code)}
                        >
                          <RotateCcw size={15} />
                        </button>
                      </Tooltip>
                      <Tooltip title="Copiar código">
                        <button
                          className="iconbtn"
                          onClick={() =>
                            void navigator.clipboard.writeText(source)
                          }
                        >
                          <Copy size={15} />
                        </button>
                      </Tooltip>
                      <Tooltip title="Baixar .rage">
                        <button
                          className="iconbtn"
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = URL.createObjectURL(
                              new Blob([source], { type: "text/plain" }),
                            );
                            a.download = "main.rage";
                            a.click();
                            URL.revokeObjectURL(a.href);
                          }}
                        >
                          <Download size={15} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="editorcontainer">
                    <Editor
                      height="100%"
                      language="ragelang"
                      theme="rage"
                      value={source}
                      onChange={(v) => setSource(v || "")}
                      onMount={handleEditorMount}
                      options={{
                        fontSize: 13.5,
                        fontFamily: "JetBrains Mono, Consolas, monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        automaticLayout: true,
                        lineNumbersMinChars: 3,
                        folding: true,
                        padding: { top: 20, bottom: 20 },
                        renderLineHighlight: "line",
                        overviewRulerLanes: 0,
                        tabSize: 4,
                        smoothScrolling: true,
                      }}
                    />
                  </div>
                  <div className="editortoolbar">
                    <div className="editorstats">
                      <span>
                        <Braces size={14} /> RageLang
                      </span>
                      <span>{lines} linhas</span>
                      <span>UTF-8</span>
                    </div>
                    <div className="toolbuttons">
                      <button
                        className="compilebtn"
                        disabled={busy || !apiReady}
                        onClick={() => void submit("compile")}
                      >
                        <WandSparkles size={16} /> Compilar
                      </button>
                      <button
                        id="run-button"
                        className="runbtn"
                        disabled={busy || !apiReady}
                        onClick={() => void submit("run")}
                      >
                        <Play size={15} fill="currentColor" />
                        {busy ? "Processando..." : "Executar"}{" "}
                        <span className="hotkey">⌘ ↵</span>
                      </button>
                    </div>
                  </div>
                  <div className="terminalpane">
                    <div className="terminalhead">
                      <div className="terminaltabs">
                        <button
                          className={mode === "console" ? "active" : ""}
                          onClick={() => setMode("console")}
                        >
                          <Terminal size={15} /> Terminal
                        </button>
                        <button
                          className={mode === "csharp" ? "active" : ""}
                          onClick={() => setMode("csharp")}
                        >
                          <Code2 size={15} /> Código C#
                        </button>
                      </div>
                      <div className="terminalextras">
                        <span>
                          {result?.ok ? "● Compilado" : "● Aguardando"}
                        </span>
                        <button
                          onClick={() => {
                            setLogs([
                              {
                                type: "info",
                                content:
                                  "Terminal limpo. Pronto para compilar.",
                              },
                            ]);
                            setResult(null);
                          }}
                          title="Limpar terminal"
                        >
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    </div>
                    {mode === "console" ? (
                      <div className="terminalbody">
                        {logs.map((log, i) => (
                          <div className={`log log-${log.type}`} key={i}>
                            {log.type === "error" ? (
                              <CircleAlert size={14} />
                            ) : log.type === "success" ? (
                              <Check size={14} />
                            ) : log.type === "info" ? (
                              <span className="prompt">›</span>
                            ) : (
                              <span className="prompt">$</span>
                            )}
                            <pre>{log.content}</pre>
                          </div>
                        ))}
                        <div ref={bottomRef} />
                      </div>
                    ) : (
                      <div className="csharpbody">
                        {result?.csharp ? (
                          <>
                            <div className="csharptop">
                              <span>Programa.cs — gerado automaticamente</span>
                              <button
                                onClick={() =>
                                  void navigator.clipboard.writeText(
                                    result.csharp || "",
                                  )
                                }
                              >
                                <Copy size={14} /> Copiar
                              </button>
                            </div>
                            <pre>{result.csharp}</pre>
                          </>
                        ) : (
                          <div className="emptycsharp">
                            <Code2 size={28} />
                            <p>
                              Compile um programa para visualizar o C# gerado.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="inputbar">
                    <div>
                      <strong>Entrada do programa</strong>
                      <span>Uma entrada por linha para ASK_ME_ANYTHING</span>
                    </div>
                    <textarea
                      value={inputs}
                      onChange={(e) => setInputs(e.target.value)}
                      placeholder={"Ex.: 9001\n(Preencha antes de executar)"}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              <div className="workspacebottom">
                <span>
                  <Zap size={14} /> Dica: pressione <kbd>Ctrl</kbd> +{" "}
                  <kbd>Enter</kbd> para executar.
                </span>
                <span>RageLang → Python AST → C#</span>
              </div>
            </section>
          ) : tab === "docs" ? (
            <section className="contentsection">
              <div className="sectioneyebrow">REFERÊNCIA DA LINGUAGEM</div>
              <h2>
                O dicionário dos <span>memes.</span>
              </h2>
              <p>Conheça os comandos suportados nesta versão da RageLang.</p>
              <div className="docgrid">
                {keywords.map(([rage, usual, meaning]) => (
                  <div className="docitem" key={rage}>
                    <code>{rage}</code>
                    <span>→ {usual}</span>
                    <p>{meaning}</p>
                  </div>
                ))}
              </div>
              <div className="notebox">
                <BookOpen size={20} />
                <div>
                  <strong>Como escrever RageLang?</strong>
                  <p>
                    Declare variáveis com POKER_FACE, use tipos OVER_9000,
                    ME_GUSTA ou FUCK_YEAH, finalize instruções com ponto e
                    vírgula e delimite blocos com chaves. Funções, listas e
                    NOT_BAD ainda não foram implementados.
                  </p>
                </div>
              </div>
              <button
                className="primarybtn"
                onClick={() => setTab("playground")}
              >
                Testar no playground <ArrowRight size={16} />
              </button>
            </section>
          ) : (
            <section className="contentsection">
              <div className="sectioneyebrow">POR TRÁS DOS MEMES</div>
              <h2>
                Da ideia ao <span>compilador.</span>
              </h2>
              <p>
                RageLang é um projeto acadêmico de Compiladores feito com
                Python. O site foi construído em React e TypeScript.
              </p>
              <div className="pipeline">
                {[
                  [
                    "01",
                    "Análise léxica",
                    "lexer.py",
                    "Identifica palavras-chave, números, operadores e outros tokens.",
                  ],
                  [
                    "02",
                    "Análise sintática",
                    "parser.py",
                    "Interpreta as regras da gramática e constrói uma AST.",
                  ],
                  [
                    "03",
                    "Análise semântica",
                    "compiler.py",
                    "Verifica tipos, constantes, variáveis e escopos.",
                  ],
                  [
                    "04",
                    "Geração C#",
                    "compiler.py",
                    "Produz um programa C# equivalente ao código RageLang.",
                  ],
                  [
                    "05",
                    "Execução didática",
                    "runner.py",
                    "Executa a AST com limites de passos e saída, sem rodar C# no servidor.",
                  ],
                ].map(([n, title, file, desc]) => (
                  <div className="pipelineitem" key={n}>
                    <span className="pipenum">{n}</span>
                    <div>
                      <strong>{title}</strong>
                      <code>{file}</code>
                      <p>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="notebox">
                <CircleAlert size={20} />
                <div>
                  <strong>Compilação versus execução</strong>
                  <p>
                    O botão Compilar utiliza a cadeia original RageLang → C#. Já
                    Executar usa um interpretador seguro da AST, apenas para
                    demonstrar os programas no navegador. Não é uma execução do
                    C# pelo .NET.
                  </p>
                </div>
              </div>
            </section>
          )}
          <div className="featurestrip">
            <div>
              <div className="featureicon purple">
                <Code2 size={22} />
              </div>
              <strong>Sintaxe original</strong>
              <p>Palavras-chave inspiradas nos memes que fizeram história.</p>
            </div>
            <div>
              <div className="featureicon blue">
                <Braces size={22} />
              </div>
              <strong>Compilação de verdade</strong>
              <p>Lexer, parser, análise semântica e geração de C#.</p>
            </div>
            <div>
              <div className="featureicon green">
                <SquareTerminal size={22} />
              </div>
              <strong>Playground interativo</strong>
              <p>Editor completo e terminal para aprender fazendo.</p>
            </div>
          </div>
        </main>
        <footer>
          <div className="footerinner">
            <Logo />
            <span>
              Feito com <span className="heart">♥</span> e uma dose de memes. ©
              RageLang
            </span>
            <button onClick={() => setTab("about")}>
              Sobre o projeto <ExternalLink size={14} />
            </button>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
