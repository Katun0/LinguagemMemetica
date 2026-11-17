import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  Code2,
  Copy,
  Download,
  FileCode2,
  Menu,
  Play,
  RotateCcw,
  Terminal,
  X,
} from "lucide-react";
import { examples, keywords, type ExampleKey } from "./examples";

type Page = "playground" | "docs" | "about";
type Action = "compile" | "run";
type Log = { type: "info" | "success" | "error" | "output"; content: string };
type Result = {
  ok: boolean;
  csharp?: string;
  output?: string;
  tokens?: number;
  steps?: number;
  error?: string;
  stage?: string;
};
const API = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const FACES = [
  {
    name: "Trollface",
    file: "trollface",
    caption: "Problem?",
    color: "yellow",
  },
  { name: "Me Gusta", file: "megusta", caption: "Me gusta", color: "white" },
  { name: "Rage Guy", file: "rage", caption: "FFFFUUUU!", color: "red" },
  { name: "Derp", file: "derp", caption: "Herp derp", color: "white" },
  {
    name: "Forever Alone",
    file: "forever",
    caption: "Forever... alone.",
    color: "yellow",
  },
  { name: "Okay Guy", file: "okay", caption: "...okay.", color: "white" },
];

function Face({ name, className = "" }: { name: string; className?: string }) {
  return (
    <img
      className={className}
      src={`/memes/${name}.svg`}
      alt={`Rosto ilustrado no estilo Rage Comics: ${name}`}
      draggable={false}
    />
  );
}

function Header({
  page,
  setPage,
  onGo,
}: {
  page: Page;
  setPage: (p: Page) => void;
  onGo: () => void;
}) {
  const [open, setOpen] = useState(false);
  const choose = (p: Page) => {
    setOpen(false);
    if (p === "playground") {
      onGo();
    } else if (p === page) {
      document
        .getElementById(p === "docs" ? "docs" : "about")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setPage(p);
    }
  };
  return (
    <header className="topbar">
      <div className="navinner">
        <button
          className="wordmark"
          onClick={() => choose("playground")}
          aria-label="RageLang início"
        >
          <Face name="trollface" />{" "}
          <span>
            RAGE<span>LANG</span>
            <b>!</b>
          </span>
        </button>
        <nav
          className={open ? "navlinks opened" : "navlinks"}
          aria-label="Navegação principal"
        >
          <button
            className={page === "playground" ? "chosen" : ""}
            onClick={() => choose("playground")}
          >
            PLAYGROUND
          </button>
          <button
            className={page === "docs" ? "chosen" : ""}
            onClick={() => choose("docs")}
          >
            DICIONÁRIO MEME
          </button>
          <button
            className={page === "about" ? "chosen" : ""}
            onClick={() => choose("about")}
          >
            SOBRE O PROJETO
          </button>
        </nav>
        <div className="headerstamp">
          EST. 2008 <span>★</span> v1.0
        </div>
        <button
          className="menu-toggle"
          aria-label="Abrir menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}

// Memes decorativos: as imagens podem ser trocadas em public/memes/side/.
function SideMemes({ area }: { area: "hero" | "gallery" }) {
  const stickers =
    area === "hero"
      ? [
          {
            file: "fuck-yea",
            caption: "FUCK YEA!",
            side: "left",
            placement: "one",
          },
          {
            file: "troll-stick",
            caption: "PROBLEM?",
            side: "right",
            placement: "two",
          },
        ]
      : [
          {
            file: "derpina",
            caption: "ME GUSTA!",
            side: "left",
            placement: "three",
          },
          {
            file: "troll-dark",
            caption: "U MAD BRO?",
            side: "right",
            placement: "four",
          },
        ];
  return (
    <div className={`side-memes side-memes-${area}`} aria-hidden="true">
      {stickers.map((m) => (
        <div key={m.file} className={`side-meme ${m.side} side-${m.placement}`}>
          <img src={`/memes/side/${m.file}.webp`} alt="" loading="lazy" />
          <span>{m.caption}</span>
        </div>
      ))}
    </div>
  );
}

function RapDosMemes() {
  return (
    <section className="rap-section" aria-label="Rap dos Memes de Cauê Moura">
      <div className="rap-heading">
        <span>♫ PLAYLIST DA NOSTALGIA</span>
        <b>RAP DOS MEMES</b>
        <small>CAUÊ MOURA • A INSPIRAÇÃO</small>
      </div>
      <div className="rap-video">
        <iframe
          title="Cauê Moura — Rap dos Memes (YouTube)"
          src="https://www.youtube-nocookie.com/embed/YtpATpMKDkg"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <p>
        O som que inspirou a linguagem.{" "}
        <a
          href="https://www.youtube.com/watch?v=YtpATpMKDkg"
          target="_blank"
          rel="noopener noreferrer"
        >
          Assistir diretamente no YouTube ↗
        </a>
      </p>
    </section>
  );
}

function Hero({
  onStart,
  onDocs,
}: {
  onStart: () => void;
  onDocs: () => void;
}) {
  return (
    <section className="hero graphpaper" id="top">
      <SideMemes area="hero" />
      <div className="hero-inner">
        <div className="est-stamp">EST. 2008 • 4CHAN /B/ • FACEBOOK MEMES</div>
        <h1>
          RAGE<span>LANG</span>
        </h1>
        <p className="hero-subtitle">
          A linguagem de programação que nasceu dos memes.
          <br />
          Trollface. Me Gusta. Forever Alone.{" "}
          <strong>O código mais nostálgico da internet.</strong>
        </p>
        <div
          className="meme-poster"
          role="img"
          aria-label="Colagem ilustrada de rostos clássicos no estilo Rage Comics"
        >
          <div className="poster-faces">
            {[
              "rage",
              "derp",
              "megusta",
              "forever",
              "okay",
              "trollface",
              "derp",
              "rage",
            ].map((n, i) => (
              <Face name={n} key={i} className={`poster-face face-${i}`} />
            ))}
          </div>
          <div className="poster-title">
            RAGE<span>COMICS</span>
          </div>
          <div className="poster-scribble">PROBLEM? ☺</div>
        </div>
        <RapDosMemes />
        <div className="hero-cta">
          <button className="comic-btn red" onClick={onStart}>
            PROGRAMAR AGORA <ArrowDown size={17} />
          </button>
          <button className="comic-btn plain" onClick={onDocs}>
            CONHECER OS MEMES <ArrowRight size={17} />
          </button>
        </div>
        <div className="hero-corner left">
          U MAD
          <br />
          BRO?
        </div>
        <div className="hero-corner right">
          EPIC
          <br />
          WIN!
        </div>
      </div>
    </section>
  );
}

function MemeGallery() {
  return (
    <section className="gallery-section" aria-labelledby="gallery-title">
      <SideMemes area="gallery" />
      <div className="section-label">THE ORIGINAL GANG — CIRCA 2008</div>
      <h2 id="gallery-title" className="comic-heading">
        OS ROSTOS DA <em>RAGELANG</em>
      </h2>
      <p className="section-description">
        Antes dos reels, antes dos trends... eles já dominavam a internet.
      </p>
      <div className="meme-gallery">
        {FACES.map((m, i) => (
          <article
            className={`meme-card card-${m.color}`}
            key={m.name}
            style={
              { "--tilt": `${[-2, 2, -1, 2, -2, 1][i]}deg` } as CSSProperties
            }
          >
            <div className="meme-image">
              <Face name={m.file} />
            </div>
            <div className="meme-divider" />
            <strong>{m.name}</strong>
            <span>“{m.caption}”</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function Playground({
  service,
  source,
  setSource,
  active,
  selectExample,
  inputs,
  setInputs,
  result,
  logs,
  busy,
  action,
  mode,
  setMode,
  onMount,
}: {
  service: "checking" | "online" | "offline";
  source: string;
  setSource: (s: string) => void;
  active: ExampleKey;
  selectExample: (key: ExampleKey) => void;
  inputs: string;
  setInputs: (s: string) => void;
  result: Result | null;
  logs: Log[];
  busy: boolean;
  action: (a: Action) => void;
  mode: "console" | "csharp";
  setMode: (m: "console" | "csharp") => void;
  onMount: OnMount;
}) {
  const [sidebar, setSidebar] = useState(false);
  const [localLogs, setLocalLogs] = useState<Log[] | null>(null);
  const terminalRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => setLocalLogs(null), [logs]);
  const shownLogs = localLogs ?? logs;
  // Rolagem restrita ao terminal: nunca altera o scroll da página.
  useEffect(() => {
    if (mode === "console" && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [shownLogs, mode]);
  const lines = useMemo(() => source.split("\n").length, [source]);
  const saveSource = () => {
    const url = URL.createObjectURL(new Blob([source], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "main.rage";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  return (
    <section className="playground-section" id="workspace">
      <div className="work-header">
        <div>
          <div className="section-label">YOUR OWN MEME LABORATORY</div>
          <h2 className="comic-heading">
            O LABORATÓRIO <em>MEMÉTICO</em>
          </h2>
          <p>
            Escreva RageLang, compile para C# e execute direto no playground.
          </p>
        </div>
        <div className={`server-label ${service}`}>
          ●{" "}
          {service === "online"
            ? "COMPILADOR ONLINE"
            : service === "offline"
              ? "BACKEND DESCONECTADO"
              : "CONECTANDO..."}
        </div>
      </div>
      <div className="ide">
        <aside className={`filespanel ${sidebar ? "opened" : ""}`}>
          <div className="ide-panel-label">
            <span>☰ ARQUIVOS .RAGE</span>
            <button className="sidebar-close" onClick={() => setSidebar(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="folder-label">
            <ChevronDown size={16} /> EXEMPLOS CLÁSSICOS
          </div>
          {Object.keys(examples).map((k) => (
            <button
              className={`fileitem ${active === k ? "selected" : ""}`}
              key={k}
              onClick={() => {
                selectExample(k as ExampleKey);
                setSidebar(false);
              }}
            >
              <FileCode2 size={16} />
              <span>
                {k}.rage<small>{examples[k as ExampleKey].detail}</small>
              </span>
            </button>
          ))}
          <div className="sidebar-meme">
            <Face name="trollface" />
            <b>PROBLEM?</b>
            <p>Escolha um exemplo ou escreva seu próprio meme!</p>
          </div>
        </aside>
        <div className="workarea">
          <div className="editorbar">
            <div className="editor-left">
              <button
                className="sidebar-open"
                aria-label="Abrir exemplos"
                onClick={() => setSidebar(true)}
              >
                <Menu size={18} />
              </button>
              <span className="file-tab">
                <FileCode2 size={15} /> main.rage
              </span>
            </div>
            <div className="editor-controls">
              <button
                title="Restaurar exemplo"
                aria-label="Restaurar exemplo"
                onClick={() => setSource(examples[active].code)}
              >
                <RotateCcw size={16} />
              </button>
              <button
                title="Copiar código"
                aria-label="Copiar código"
                onClick={() => void navigator.clipboard.writeText(source)}
              >
                <Copy size={16} />
              </button>
              <button
                title="Baixar arquivo .rage"
                aria-label="Baixar arquivo"
                onClick={saveSource}
              >
                <Download size={16} />
              </button>
            </div>
          </div>
          <div className="editorcontainer">
            <Editor
              height="100%"
              language="ragelang"
              theme="comic"
              value={source}
              onChange={(v) => setSource(v ?? "")}
              onMount={onMount}
              options={{
                fontSize: 14,
                fontFamily: '"JetBrains Mono", Consolas, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
                lineNumbersMinChars: 3,
                folding: true,
                padding: { top: 18, bottom: 18 },
                tabSize: 4,
              }}
            />
          </div>
          <div className="editortoolbar">
            <div className="editorstats">
              {lines} linhas <span>• UTF-8</span> <span>• RAGELANG</span>
            </div>
            <div className="toolbuttons">
              <button
                className="comic-btn yellow"
                disabled={busy || service === "offline"}
                onClick={() => action("compile")}
              >
                <Code2 size={17} /> COMPILAR
              </button>
              <button
                className="comic-btn red"
                id="run-button"
                disabled={busy || service === "offline"}
                onClick={() => action("run")}
              >
                <Play size={16} fill="currentColor" />{" "}
                {busy ? "PROCESSANDO..." : "EXECUTAR"}
              </button>
            </div>
          </div>
          <div className="terminal-head">
            <div className="terminal-tabs">
              <button
                className={mode === "console" ? "on" : ""}
                onClick={() => setMode("console")}
              >
                <Terminal size={16} /> TERMINAL
              </button>
              <button
                className={mode === "csharp" ? "on" : ""}
                onClick={() => setMode("csharp")}
              >
                <Code2 size={16} /> C# GERADO
              </button>
            </div>
            <button
              className="clearbtn"
              title="Limpar terminal"
              onClick={() => {
                setLocalLogs([
                  {
                    type: "info",
                    content: "Terminal limpo. Pronto para compilar.",
                  },
                ]);
                setMode("console");
              }}
            >
              <RotateCcw size={15} />
            </button>
          </div>
          {mode === "console" ? (
            <div className="terminalbody" ref={terminalRef}>
              {shownLogs.map((l, i) => (
                <div className={`log log-${l.type}`} key={i}>
                  <span>
                    {l.type === "success"
                      ? "✔"
                      : l.type === "error"
                        ? "✖"
                        : ">"}
                  </span>
                  <pre>{l.content}</pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="csharpbody">
              {result?.csharp ? (
                <>
                  <div className="csharpbar">
                    <span>Programa.cs — traduzido pelo Python</span>
                    <button
                      onClick={() =>
                        void navigator.clipboard.writeText(result.csharp ?? "")
                      }
                    >
                      <Copy size={14} /> COPIAR
                    </button>
                  </div>
                  <pre>{result.csharp}</pre>
                </>
              ) : (
                <div className="emptycsharp">
                  Clique em COMPILAR para gerar o código C#.
                </div>
              )}
            </div>
          )}
          <div className="inputbar">
            <label htmlFor="program-input">
              <b>ENTRADA DO PROGRAMA</b>
              <small>Uma entrada por linha para ASK_ME_ANYTHING</small>
            </label>
            <textarea
              id="program-input"
              value={inputs}
              onChange={(e) => setInputs(e.target.value)}
              rows={2}
              placeholder="Ex.: 9001"
            />
          </div>
        </div>
      </div>
      <div className="ide-foot">
        <span>★ DICA: CTRL + ENTER PARA EXECUTAR</span>
        <span>RAGELANG → PYTHON AST → C#</span>
      </div>
    </section>
  );
}

function Docs() {
  return (
    <section className="docs-section" id="docs">
      <div className="section-label">THE RAGE LANGUAGE DICTIONARY</div>
      <h2 className="comic-heading">
        O DICIONÁRIO DOS <em>MEMES</em>
      </h2>
      <p className="section-description">
        Cada palavra-chave tem uma história, um meme e uma função.
      </p>
      <div className="docs-grid">
        {keywords.map(([rage, normal, desc], i) => (
          <article
            className={`doc-card ${i % 4 === 0 ? "highlight" : ""}`}
            key={rage}
          >
            <span className="doc-number">
              #{String(i + 1).padStart(2, "0")}
            </span>
            <code>{rage}</code>
            <b>→ {normal}</b>
            <p>{desc}</p>
            <Face name={FACES[i % FACES.length].file} />
          </article>
        ))}
      </div>
      <div className="notice-panel">
        <strong>COMO ESCREVER RAGELANG?</strong>
        <p>
          Use POKER_FACE para variáveis, DERP para condições, FOREVER_ALONE para
          repetições e CEREAL_GUY para imprimir. Cada instrução termina em ponto
          e vírgula. Funções e listas ainda não foram implementadas.
        </p>
      </div>
    </section>
  );
}

function About() {
  const stages = [
    [
      "01",
      "LEXER",
      "lexer.py",
      "Reconhece palavras-chave e transforma código em tokens.",
    ],
    [
      "02",
      "PARSER",
      "parser.py",
      "Verifica a gramática e monta a árvore sintática AST.",
    ],
    [
      "03",
      "SEMÂNTICA",
      "compiler.py",
      "Confere tipos de dados, constantes e escopos.",
    ],
    [
      "04",
      "GERADOR C#",
      "compiler.py",
      "Traduz a AST para um arquivo C# válido.",
    ],
    [
      "05",
      "RUNNER",
      "runner.py",
      "Executa a AST em modo didático com limites de execução.",
    ],
  ];
  return (
    <section className="about-section" id="about">
      <div className="section-label">THE LORE BEHIND THE CODE</div>
      <h2 className="comic-heading">
        COMO NASCEU A <em>RAGELANG?</em>
      </h2>
      <div className="lore-grid">
        <article className="lore-box yellow">
          <h3>A IDEIA</h3>
          <p>
            Inspirada nos Rage Comics que marcaram a internet dos anos 2000 e
            2010 e na nostalgia do “Rap dos Memes”, a RageLang traduz conceitos
            de programação em nomes como TROLLFACE, DERP e FOREVER_ALONE.
          </p>
        </article>
        <article className="lore-box">
          <h3>A LINGUAGEM</h3>
          <p>
            Um projeto acadêmico construído em Python. O frontend usa React e
            TypeScript, enquanto o compilador passa por análise léxica,
            sintática, semântica e geração de código C#.
          </p>
        </article>
        <article className="lore-box red">
          <h3>O OBJETIVO</h3>
          <p>
            Entender de verdade como um compilador funciona e transformar isso
            em uma experiência divertida, educativa e memorável.
          </p>
        </article>
      </div>
      <h3 className="pipeline-heading">FROM MEME TO MACHINE</h3>
      <div className="pipeline">
        {stages.map(([n, title, file, desc]) => (
          <div className="pipeline-step" key={n}>
            <span className="stepnum">{n}</span>
            <div>
              <strong>{title}</strong>
              <code>{file}</code>
              <p>{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="notice-panel">
        <strong>COMPILAR ≠ EXECUTAR</strong>
        <p>
          Compilar produz C# a partir do código RageLang. Executar usa um
          interpretador didático da AST no backend Python — não executa o C# no
          servidor.
        </p>
      </div>
    </section>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("playground");
  const [active, setActive] = useState<ExampleKey>("poder");
  const [source, setSource] = useState<string>(examples.poder.code);
  const [inputs, setInputs] = useState("");
  const [mode, setMode] = useState<"console" | "csharp">("console");
  const [result, setResult] = useState<Result | null>(null);
  const [logs, setLogs] = useState<Log[]>([
    { type: "info", content: "RageLang Terminal v1.0 • 2008 Edition" },
    { type: "info", content: "Trollface carregado. PROBLEM?" },
    { type: "info", content: "Pronto. Pressione EXECUTAR ou Ctrl + Enter." },
  ]);
  const [busy, setBusy] = useState(false);
  const [service, setService] = useState<"checking" | "online" | "offline">(
    "checking",
  );
  // Evita a restauração automática da posição antiga ao reabrir a página.
  useLayoutEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    const old = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    const frame = requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = old;
    });
    return () => {
      cancelAnimationFrame(frame);
      history.scrollRestoration = previous;
      document.documentElement.style.scrollBehavior = old;
    };
  }, []);
  const lastPage = useRef<Page>(page);
  useEffect(() => {
    if (lastPage.current === page) return;
    lastPage.current = page;
    const id =
      page === "docs" ? "docs" : page === "about" ? "about" : "workspace";
    const frame = requestAnimationFrame(() =>
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [page]);
  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/health`)
      .then((r) => {
        if (!r.ok) throw Error();
        if (!cancelled) setService("online");
      })
      .catch(() => {
        if (!cancelled) setService("offline");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function scrollToWorkspace() {
    if (page !== "playground") setPage("playground");
    else
      document
        .getElementById("workspace")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function selectExample(k: ExampleKey) {
    setActive(k);
    setSource(examples[k].code);
    setResult(null);
    setMode("console");
    setLogs([
      { type: "info", content: `Exemplo carregado: ${examples[k].name}` },
      { type: "info", content: "Pressione COMPILAR ou EXECUTAR." },
    ]);
  }
  async function submit(action: Action) {
    if (busy) return;
    setBusy(true);
    setMode("console");
    setLogs([
      {
        type: "info",
        content: `$ ragelang ${action === "compile" ? "--compile" : "--run"} main.rage`,
      },
      { type: "info", content: "Analisando código RageLang..." },
    ]);
    try {
      const response = await fetch(`${API}/api/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, inputs }),
      });
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      const data: Result = await response.json();
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
          content: `Análise concluída · ${data.tokens ?? 0} tokens`,
        },
        { type: "success", content: "Código C# gerado com sucesso" },
        ...(action === "run"
          ? [
              { type: "info" as const, content: "── SAÍDA DO PROGRAMA ──" },
              {
                type: "output" as const,
                content: data.output || "(Nenhuma saída)",
              },
              {
                type: "success" as const,
                content: `Fim · ${data.steps ?? 0} passos`,
              },
            ]
          : [{ type: "info" as const, content: "Confira a aba C# GERADO." }]),
      ]);
      if (action === "compile") setMode("csharp");
      setService("online");
    } catch (e) {
      setLogs((prev) => [
        ...prev,
        {
          type: "error",
          content: `Falha de conexão: ${e instanceof Error ? e.message : String(e)}. Verifique o backend Python na porta 8000.`,
        },
      ]);
      setService("offline");
    } finally {
      setBusy(false);
    }
  }
  const handleMount: OnMount = (editor, monaco) => {
    if (
      !monaco.languages
        .getLanguages()
        .some((l: { id: string }) => l.id === "ragelang")
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
    }
    monaco.editor.defineTheme("comic", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "FFCC00", fontStyle: "bold" },
        { token: "type", foreground: "77D7EB" },
        { token: "constant", foreground: "FF7575" },
        { token: "string", foreground: "A3E7A3" },
        { token: "comment", foreground: "818D99", fontStyle: "italic" },
        { token: "number", foreground: "F9B86D" },
      ],
      colors: {
        "editor.background": "#17191E",
        "editor.foreground": "#FFFFFF",
        "editorLineNumber.foreground": "#777A81",
        "editorCursor.foreground": "#FFDB00",
        "editor.selectionBackground": "#82691A99",
        "editor.lineHighlightBackground": "#FFFFFF0B",
      },
    });
    monaco.editor.setTheme("comic");
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () =>
      document.getElementById("run-button")?.click(),
    );
  };
  return (
    <div className="app">
      <Header page={page} setPage={setPage} onGo={scrollToWorkspace} />
      <Hero onStart={scrollToWorkspace} onDocs={() => setPage("docs")} />
      <main className="site-main">
        {page === "playground" ? (
          <>
            <MemeGallery />
            <Playground
              service={service}
              source={source}
              setSource={setSource}
              active={active}
              selectExample={selectExample}
              inputs={inputs}
              setInputs={setInputs}
              result={result}
              logs={logs}
              busy={busy}
              action={submit}
              mode={mode}
              setMode={setMode}
              onMount={handleMount}
            />
          </>
        ) : page === "docs" ? (
          <Docs />
        ) : (
          <About />
        )}
      </main>
      <footer className="footer">
        <div>
          <b>RAGELANG.EXE</b>
          <span>© 2026 • FEITO COM MEMES, CAFÉ E CÓDIGO.</span>
          <span>
            PROBLEM? <Face name="trollface" />
          </span>
        </div>
      </footer>
    </div>
  );
}
