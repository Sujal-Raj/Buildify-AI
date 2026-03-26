'use client'

import axios from "axios";
import { useState, useEffect, useRef, useCallback } from "react"
import { Sandpack } from "@codesandbox/sandpack-react";

// ─── Typewriter hook ────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 4, active = false) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!active) { setDisplayed(""); return; }
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, active, speed]);
  return displayed;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const FILE_ICONS: Record<string, string> = {
  jsx: "⚛", js: "JS", css: "✦", ts: "TS", tsx: "⚛", html: "◇",
};
function getExt(name: string) { return name.split(".").pop() || ""; }

// ─── Syntax tokenizer ────────────────────────────────────────────────────────
function tokenize(line: string): { text: string; cls: string }[] {
  const tokens: { text: string; cls: string }[] = [];
  let rest = line;
  const rules: [RegExp, string][] = [
    [/^(\/\/.*$)/, "tok-comment"],
    [/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/, "tok-string"],
    [/^(\b(?:import|export|default|from|const|let|var|function|return|if|else|for|while|class|extends|new|typeof|instanceof|in|of|async|await|try|catch|throw|null|undefined|true|false|void|this|super|static|get|set|type|interface|enum|as)\b)/, "tok-keyword"],
    [/^(\b(?:React|useState|useEffect|useRef|useCallback|useMemo|ReactDOM|document|window|console|Math|Date|JSON|Object|Array|String|Number|Boolean|Promise)\b)/, "tok-builtin"],
    [/^(<\/?[A-Z][a-zA-Z0-9]*)/, "tok-component"],
    [/^(<\/?[a-z][a-zA-Z0-9-]*)/, "tok-tag"],
    [/^(\b\d+\.?\d*\b)/, "tok-number"],
    [/^([{}[\]().,;:?!+\-*/%=<>&|^~@])/, "tok-punct"],
    [/^([a-zA-Z_$][a-zA-Z0-9_$]*)/, "tok-ident"],
    [/^(\s+)/, "tok-ws"],
    [/^(.)/, "tok-other"],
  ];
  while (rest.length > 0) {
    let matched = false;
    for (const [re, cls] of rules) {
      const m = rest.match(re);
      if (m) { tokens.push({ text: m[1], cls }); rest = rest.slice(m[1].length); matched = true; break; }
    }
    if (!matched) { tokens.push({ text: rest[0], cls: "tok-other" }); rest = rest.slice(1); }
  }
  return tokens;
}

// ─── Highlighted code display ────────────────────────────────────────────────
function HighlightedCode({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <div className="hl">
      <div className="hl__gutter">
        {lines.map((_, i) => <div key={i} className="hl__ln">{i + 1}</div>)}
      </div>
      <div className="hl__body">
        {lines.map((line, i) => (
          <div key={i} className="hl__line">
            {tokenize(line).map((tok, j) => (
              <span key={j} className={tok.cls}>{tok.text}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Code editor (highlight + transparent textarea overlay) ──────────────────
function CodeEditor({ code, animating, onChange }: { code: string; animating: boolean; onChange: (v: string) => void }) {
  const displayed = useTypewriter(code, 4, animating);
  const value = animating ? displayed : code;
  return (
    <div className="ceditor">
      <HighlightedCode code={value} />
      {!animating && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="ceditor__ta"
          aria-label="Code editor"
        />
      )}
      {animating && <span className="ceditor__cursor" />}
    </div>
  );
}

// ─── Sandpack preview-only panel ─────────────────────────────────────────────
function PreviewPanel({ files, refreshKey }: { files: Record<string, string>; refreshKey: number }) {
  const appCode = files["App.jsx"] || files["App.js"] || Object.values(files)[0] || "";
  const cssCode = files["styles.css"] || files["index.css"] || "";
  return (
    <div key={refreshKey} className="sp-host">
      <Sandpack
        template="react"
        theme="light"
        options={{
          showNavigator: false,
          showTabs: false,
          showLineNumbers: false,
          showInlineErrors: true,
          wrapContent: true,
          layout: "preview",
          editorHeight: 0,
        }}
        files={{
          "/App.js": appCode,
          "/index.js": `import React from "react"; import { createRoot } from "react-dom/client"; import App from "./App"; import "./styles.css"; createRoot(document.getElementById("root")).render(<App />);`,
          "/styles.css": cssCode,
        }}
      />
    </div>
  );
}

// ─── File tab ─────────────────────────────────────────────────────────────────
function FileTab({ name, active, onClick }: { name: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`ftab ${active ? "ftab--on" : ""}`}>
      <span className="ftab__ico">{FILE_ICONS[getExt(name)] || "◈"}</span>
      {name}
    </button>
  );
}

const SUGGESTIONS = ["Modern SaaS landing page", "AI portfolio with glassmorphism", "Dashboard with dark theme", "E-commerce product card"];
const STATUS_MSGS  = ["Thinking…", "Designing…", "Writing JSX…", "Styling…", "Finalizing…"];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StartBuildingPage() {
  const [prompt, setPrompt]           = useState("");
  const [loading, setLoading]         = useState(false);
  const [files, setFiles]             = useState<Record<string, string> | null>(null);
  const [activeFile, setActiveFile]   = useState<string>("");
  const [animatingFile, setAnimating] = useState<string>("");
  const [error, setError]             = useState<string | null>(null);
  const [statusMsg, setStatusMsg]     = useState(STATUS_MSGS[0]);
  const [view, setView]               = useState<"code" | "preview" | "split">("split");
  const [refreshKey, setRefreshKey]   = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) return;
    let i = 0; setStatusMsg(STATUS_MSGS[0]);
    const id = setInterval(() => { i = (i + 1) % STATUS_MSGS.length; setStatusMsg(STATUS_MSGS[i]); }, 1400);
    return () => clearInterval(id);
  }, [loading]);

  const handleGenerate = async () => {
    if (!prompt.trim()) { inputRef.current?.focus(); return; }
    setLoading(true); setFiles(null); setError(null); setActiveFile(""); setAnimating("");
    try {
      const res = await axios.post("/api/users/build", { prompt });
      const generated: Record<string, string> = res.data.files;
      if (!generated) throw new Error("No files returned");
      setFiles(generated);
      const keys = Object.keys(generated);
      setActiveFile(keys[0]); setAnimating(keys[0]);
      let delay = 0;
      for (const key of keys) {
        const dur = Math.max((generated[key]?.length || 0) * 4, 600);
        setTimeout(() => { setActiveFile(key); setAnimating(key); }, delay);
        delay += dur + 150;
      }
      setTimeout(() => { setAnimating(""); setRefreshKey(k => k + 1); }, delay);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const updateFile = useCallback((content: string) => {
    if (!activeFile || !files) return;
    setFiles(prev => prev ? { ...prev, [activeFile]: content } : prev);
  }, [activeFile, files]);

  const fileKeys = files ? Object.keys(files) : [];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:      #f6f6f4; --bg2: #efefed; --bg3: #e5e5e3;
          --surf:    #ffffff;
          --bdr:     rgba(0,0,0,0.08); --bdr2: rgba(0,0,0,0.14);
          --tx:      #111110; --tx2: #66665f; --tx3: #a8a8a2;
          --acc:     #2563eb; --accbg: rgba(37,99,235,0.09);
          --red:     #dc2626; --redbg: rgba(220,38,38,0.08);
          --grn:     #16a34a;
          --sh:      0 1px 3px rgba(0,0,0,0.07),0 1px 2px rgba(0,0,0,0.04);
          --shmd:    0 4px 14px rgba(0,0,0,0.1);
          --r: 10px; --rlg: 14px;
          --ebg:  #1e1e2e; --etx: #cdd6f4;
          --egut: #181825; --eln: #45475a;
          --ebdr: rgba(255,255,255,0.06);
          font-family: 'Berkeley Mono','Fira Code',ui-monospace,monospace;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bg:#111110; --bg2:#18181a; --bg3:#202022;
            --surf:#1c1c1e;
            --bdr:rgba(255,255,255,0.07); --bdr2:rgba(255,255,255,0.13);
            --tx:#f0efe9; --tx2:#888880; --tx3:#55554f;
            --acc:#3b82f6; --accbg:rgba(59,130,246,0.12);
            --red:#f87171; --redbg:rgba(248,113,113,0.1);
            --grn:#4ade80;
            --sh:0 1px 3px rgba(0,0,0,0.4);
            --shmd:0 4px 16px rgba(0,0,0,0.5);
          }
        }
        html,body{height:100%;}

        .app {
          height:100vh; display:flex; flex-direction:column;
          background:var(--bg); color:var(--tx); overflow:hidden;
        }

        /* NAV */
        .nav {
          flex-shrink:0; display:flex; align-items:center;
          justify-content:space-between; padding:0 18px; height:48px;
          background:var(--bg); border-bottom:1px solid var(--bdr); z-index:10;
        }
        .nav__brand { display:flex; align-items:center; gap:7px; font-size:13px; font-weight:600; letter-spacing:-0.025em; }
        .nav__dot { width:7px;height:7px;border-radius:50%;background:var(--acc); }
        .nav__badge { font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.1em;font-weight:400;padding:2px 7px;border:1px solid var(--bdr);border-radius:99px; }
        .nav__r { display:flex;align-items:center;gap:7px; }
        .vtog { display:flex;gap:2px;background:var(--bg2);border:1px solid var(--bdr);border-radius:var(--r);padding:3px; }
        .vb { padding:3px 10px;border-radius:7px;border:none;background:transparent;color:var(--tx2);font-size:11px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .1s; }
        .vb:hover { color:var(--tx); }
        .vb--on { background:var(--surf);color:var(--tx);box-shadow:var(--sh); }
        .ghost { padding:4px 11px;border:1px solid var(--bdr);border-radius:var(--r);background:transparent;color:var(--tx2);font-size:11px;font-family:inherit;cursor:pointer;transition:all .1s; }
        .ghost:hover { color:var(--tx);border-color:var(--bdr2);background:var(--bg2); }

        /* WORKSPACE */
        .ws { flex:1;display:flex;overflow:hidden; }

        /* HERO */
        .hero { flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 24px 60px; }
        .hero__ey { display:flex;align-items:center;gap:6px;font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.12em;margin-bottom:18px; }
        .hero__edot { width:5px;height:5px;border-radius:50%;background:var(--acc); }
        .hero__h1 { font-size:clamp(26px,5vw,46px);font-weight:700;letter-spacing:-.04em;line-height:1.1;margin-bottom:10px; }
        .hero__h1 em { font-style:normal;color:var(--acc); }
        .hero__sub { font-size:13.5px;color:var(--tx2);max-width:340px;line-height:1.6;margin-bottom:22px;font-family:ui-sans-serif,system-ui,sans-serif; }
        .hero__chips { display:flex;flex-wrap:wrap;gap:6px;justify-content:center; }
        .hero__chip { padding:5px 13px;border:1px solid var(--bdr2);border-radius:99px;background:var(--surf);color:var(--tx2);font-size:12px;font-family:inherit;cursor:pointer;transition:all .12s; }
        .hero__chip:hover { background:var(--accbg);border-color:var(--acc);color:var(--acc); }

        /* SKELETON */
        .skel { flex:1;display:flex;overflow:hidden; }
        .skel__c { flex:1;display:flex;flex-direction:column;border-right:1px solid var(--bdr);background:var(--ebg);overflow:hidden; }
        .skel__tabs { display:flex;gap:8px;padding:10px 14px;border-bottom:1px solid var(--ebdr);background:var(--egut); }
        .skel__tab { height:13px;border-radius:4px;background:rgba(255,255,255,.07);animation:shimmer 1.5s ease-in-out infinite; }
        .skel__lines { flex:1;padding:20px;display:flex;flex-direction:column;gap:8px; }
        .skel__line { height:9px;border-radius:3px;background:rgba(255,255,255,.05);animation:shimmer 1.5s ease-in-out infinite; }
        .skel__st { padding:7px 14px;border-top:1px solid var(--ebdr);display:flex;align-items:center;gap:7px;font-size:11px;color:#60a5fa;background:var(--egut); }
        .skel__sdot { width:5px;height:5px;border-radius:50%;background:#3b82f6;animation:pulse 1s ease-in-out infinite; }
        .skel__p { flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;background:var(--bg2); }
        .skel__spin { width:26px;height:26px;border-radius:50%;border:2px solid var(--bdr2);border-top-color:var(--acc);animation:spin .7s linear infinite; }
        .skel__pl { font-size:11px;color:var(--tx3); }
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes pulse   { 0%,100%{opacity:1}  50%{opacity:.3} }
        @keyframes spin    { to{transform:rotate(360deg)} }

        /* EDITOR PANE */
        .epane { display:flex;flex-direction:column;overflow:hidden;border-right:1px solid var(--bdr);background:var(--ebg); }
        .epane--split { width:50%; }
        .epane--full  { flex:1; }
        .tabs { display:flex;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--ebdr);background:var(--egut);flex-shrink:0; }
        .tabs::-webkit-scrollbar { display:none; }
        .ftab { display:flex;align-items:center;gap:5px;padding:8px 13px;border:none;border-right:1px solid var(--ebdr);border-bottom:2px solid transparent;background:transparent;color:var(--eln);font-size:11.5px;font-family:inherit;font-weight:500;cursor:pointer;white-space:nowrap;transition:all .1s;flex-shrink:0; }
        .ftab:hover { color:var(--etx);background:rgba(255,255,255,.04); }
        .ftab--on { color:var(--etx);border-bottom-color:var(--acc);background:rgba(255,255,255,.04); }
        .ftab__ico { font-size:9px;color:var(--acc);opacity:.7; }
        .ftab--on .ftab__ico { opacity:1; }
        .ebody { flex:1;overflow:auto;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.08) transparent; }
        .ebody::-webkit-scrollbar { width:5px; }
        .ebody::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1);border-radius:3px; }
        .ebody::-webkit-scrollbar-track { background:transparent; }

        /* HIGHLIGHTED CODE */
        .ceditor { position:relative;min-height:100%;display:flex;flex-direction:column; }
        .hl { display:flex;width:100%;min-height:100%;font-size:12.5px;line-height:20px;font-family:'Berkeley Mono','Fira Code','Cascadia Code',ui-monospace,monospace; }
        .hl__gutter { user-select:none;text-align:right;padding:18px 10px 18px 14px;color:var(--eln);font-size:11px;line-height:20px;background:var(--egut);border-right:1px solid var(--ebdr);flex-shrink:0;min-width:44px; }
        .hl__ln { line-height:20px; }
        .hl__body { flex:1;padding:18px 16px;color:var(--etx);overflow-x:auto;scrollbar-width:none; }
        .hl__body::-webkit-scrollbar { display:none; }
        .hl__line { min-height:20px;line-height:20px;white-space:pre; }

        /* token colors (catppuccin-mocha inspired) */
        .tok-keyword   { color:#cba6f7;font-weight:600; }
        .tok-string    { color:#a6e3a1; }
        .tok-comment   { color:#6c7086;font-style:italic; }
        .tok-number    { color:#fab387; }
        .tok-builtin   { color:#89dceb; }
        .tok-component { color:#89b4fa;font-weight:500; }
        .tok-tag       { color:#94e2d5; }
        .tok-punct     { color:#89dceb;opacity:.7; }
        .tok-ident     { color:#cdd6f4; }
        .tok-ws        { color:transparent; }
        .tok-other     { color:#a6adc8; }

        /* transparent overlay textarea */
        .ceditor__ta {
          position:absolute;top:0;left:44px;right:0;bottom:0;
          background:transparent;color:transparent;caret-color:#89b4fa;
          border:none;outline:none;resize:none;
          font-size:12.5px;line-height:20px;font-family:'Berkeley Mono','Fira Code','Cascadia Code',ui-monospace,monospace;
          padding:18px 16px;white-space:pre;overflow:hidden;z-index:2;scrollbar-width:none;
        }
        .ceditor__ta::-webkit-scrollbar { display:none; }
        .ceditor__cursor { position:absolute;bottom:18px;left:56px;width:2px;height:14px;background:#89b4fa;border-radius:1px;animation:pulse .8s ease-in-out infinite;z-index:3; }

        /* STATUS BAR */
        .sbar { flex-shrink:0;border-top:1px solid var(--ebdr);padding:5px 14px;display:flex;align-items:center;justify-content:space-between;background:var(--egut);font-size:10.5px;color:var(--eln); }
        .sbar__l { display:flex;align-items:center;gap:6px; }
        .sbar__dot { width:5px;height:5px;border-radius:50%; }
        .sbar__dot--w { background:#3b82f6;animation:pulse 1s ease-in-out infinite; }
        .sbar__dot--r { background:#4ade80; }
        .sbar__r { display:flex;align-items:center;gap:10px; }
        .sbar__run { color:#60a5fa;background:none;border:none;cursor:pointer;font-size:10.5px;font-family:inherit;opacity:.6;transition:opacity .1s; }
        .sbar__run:hover { opacity:1; }

        /* PREVIEW PANE */
        .ppane { display:flex;flex-direction:column;overflow:hidden; }
        .ppane--split { width:50%; }
        .ppane--full  { flex:1; }
        .pchrome { flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:7px 14px;border-bottom:1px solid var(--bdr);background:var(--bg); }
        .pchrome__l { display:flex;align-items:center;gap:8px; }
        .pchrome__dots { display:flex;gap:5px; }
        .pchrome__dot { width:8px;height:8px;border-radius:50%; }
        .pchrome__pill { padding:2px 9px;border:1px solid var(--bdr);border-radius:6px;font-size:10px;color:var(--tx3);background:var(--bg2); }
        .pchrome__ref { font-size:11px;color:var(--tx3);background:none;border:none;cursor:pointer;font-family:inherit;padding:3px 7px;border-radius:6px;transition:all .1s; }
        .pchrome__ref:hover { color:var(--tx);background:var(--bg2); }
        .pbody { flex:1;overflow:hidden;background:#fff;display:flex;flex-direction:column; }

        /* Force sandpack to fill 100% and hide its editor */
        .sp-host { width:100%;height:100%;display:flex;flex-direction:column; }
        .sp-host .sp-wrapper { height:100% !important;flex:1 !important; }
        .sp-host .sp-layout { height:100% !important;border:none !important;border-radius:0 !important; }
        .sp-host .sp-preview { flex:1 !important;height:100% !important; }
        .sp-host .sp-preview-container { height:100% !important; }
        .sp-host iframe { width:100% !important;height:100% !important;border:none !important; }
        .sp-host .sp-editor,.sp-host .sp-code-editor,.sp-host .cm-editor { display:none !important; }
        .sp-host .sp-tabs,.sp-host .sp-tab-button,.sp-host .sp-navigator { display:none !important; }
        .sp-host .sp-preview-actions { display:none !important; }

        /* PROMPT BAR — bottom */
        .pbar { flex-shrink:0;padding:13px 20px 15px;background:var(--bg);border-top:1px solid var(--bdr);z-index:10; }
        .pinner {
          max-width:680px;margin:0 auto;display:flex;align-items:center;gap:10px;
          background:var(--surf);border:1px solid var(--bdr2);border-radius:var(--rlg);
          padding:10px 14px;box-shadow:var(--shmd);transition:border-color .15s,box-shadow .15s;
        }
        .pinner:focus-within { border-color:var(--acc);box-shadow:0 0 0 3px var(--accbg),var(--shmd); }
        .pinner--loading { border-color:var(--acc);box-shadow:0 0 0 3px var(--accbg),var(--shmd); }
        .picon { font-size:12px;color:var(--tx3);flex-shrink:0;user-select:none; }
        .pinput { flex:1;border:none;background:transparent;outline:none;font-size:13.5px;color:var(--tx);font-family:inherit;min-width:0; }
        .pinput::placeholder { color:var(--tx3); }
        .pinput:disabled { opacity:.4; }
        .pchips { display:flex;gap:5px;flex-shrink:0; }
        @media(max-width:600px){.pchips{display:none;}}
        .pchip { padding:3px 8px;border:1px solid var(--bdr);border-radius:6px;background:transparent;font-size:10px;color:var(--tx3);cursor:pointer;font-family:inherit;transition:all .12s;white-space:nowrap; }
        .pchip:hover { color:var(--tx);border-color:var(--bdr2); }
        .gbtn { display:flex;align-items:center;gap:6px;padding:6px 15px;border-radius:8px;border:none;background:var(--acc);color:#fff;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;flex-shrink:0;transition:opacity .12s,transform .1s;letter-spacing:.01em; }
        .gbtn:hover { opacity:.87; }
        .gbtn:active { transform:scale(.97); }
        .gbtn:disabled { opacity:.35;cursor:not-allowed;transform:none; }
        .gbtn svg { animation:spin .8s linear infinite;width:12px;height:12px; }
        .errbar { max-width:680px;margin:8px auto 0;display:flex;align-items:center;gap:8px;padding:7px 12px;background:var(--redbg);border:1px solid rgba(220,38,38,.18);border-radius:var(--r);color:var(--red);font-size:12px; }
      `}</style>

      <div className="app">

        {/* NAV */}
        <nav className="nav">
          <div className="nav__brand">
            <div className="nav__dot" />
            Architect
            <span className="nav__badge">Build Studio</span>
          </div>
          <div className="nav__r">
            {files && (
              <div className="vtog">
                {(["code","split","preview"] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} className={`vb ${view===v?"vb--on":""}`}>
                    {v==="code"?"Code":v==="split"?"Split":"Preview"}
                  </button>
                ))}
              </div>
            )}
            {files && (
              <button className="ghost" onClick={() => { setFiles(null); setActiveFile(""); setTimeout(() => inputRef.current?.focus(), 100); }}>
                ↺ New
              </button>
            )}
          </div>
        </nav>

        {/* WORKSPACE */}
        <div className="ws">

          {/* Hero */}
          {!files && !loading && (
            <div className="hero">
              <div className="hero__ey"><span className="hero__edot" />AI-Powered Builder</div>
              <h1 className="hero__h1">Describe your <em>vision</em></h1>
              <p className="hero__sub">Turn a single prompt into a live React + Tailwind project — editable code &amp; live preview, side by side.</p>
              <div className="hero__chips">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => { setPrompt(s); inputRef.current?.focus(); }} className="hero__chip">{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && !files && (
            <div className="skel">
              <div className="skel__c">
                <div className="skel__tabs">
                  {[54,42,58].map((w,i) => <div key={i} className="skel__tab" style={{width:w,animationDelay:`${i*.15}s`}} />)}
                </div>
                <div className="skel__lines">
                  {Array.from({length:22}).map((_,i) => (
                    <div key={i} className="skel__line" style={{
                      width:`${28+Math.abs(Math.sin(i*1.9))*36+(i%4)*6}%`,
                      marginLeft:i%3===0?0:i%3===1?14:28,
                      animationDelay:`${i*.05}s`,
                    }} />
                  ))}
                </div>
                <div className="skel__st"><div className="skel__sdot" />{statusMsg}</div>
              </div>
              <div className="skel__p">
                <div className="skel__spin" />
                <span className="skel__pl">Preview loading…</span>
              </div>
            </div>
          )}

          {/* Editor + Preview */}
          {files && fileKeys.length > 0 && (
            <>
              {(view==="code"||view==="split") && (
                <div className={`epane ${view==="split"?"epane--split":"epane--full"}`}>
                  <div className="tabs">
                    {fileKeys.map(name => (
                      <FileTab key={name} name={name} active={activeFile===name} onClick={() => setActiveFile(name)} />
                    ))}
                  </div>
                  <div className="ebody">
                    {activeFile && files[activeFile]!==undefined && (
                      <CodeEditor code={files[activeFile]} animating={animatingFile===activeFile} onChange={updateFile} />
                    )}
                  </div>
                  <div className="sbar">
                    <div className="sbar__l">
                      {animatingFile
                        ? <><div className="sbar__dot sbar__dot--w"/><span>Writing {animatingFile}…</span></>
                        : <><div className="sbar__dot sbar__dot--r"/><span>Ready · editable</span></>}
                    </div>
                    <div className="sbar__r">
                      <span>{getExt(activeFile).toUpperCase()}</span>
                      <span>{files[activeFile]?.split("\n").length??0} lines</span>
                      {!animatingFile && <button className="sbar__run" onClick={() => setRefreshKey(k=>k+1)}>↺ run</button>}
                    </div>
                  </div>
                </div>
              )}

              {(view==="preview"||view==="split") && (
                <div className={`ppane ${view==="split"?"ppane--split":"ppane--full"}`}>
                  <div className="pchrome">
                    <div className="pchrome__l">
                      <div className="pchrome__dots">
                        <div className="pchrome__dot" style={{background:"#ff5f57"}} />
                        <div className="pchrome__dot" style={{background:"#febc2e"}} />
                        <div className="pchrome__dot" style={{background:"#28c840"}} />
                      </div>
                      <div className="pchrome__pill">live preview</div>
                    </div>
                    <button className="pchrome__ref" onClick={() => setRefreshKey(k=>k+1)}>↺ Refresh</button>
                  </div>
                  <div className="pbody">
                    <PreviewPanel files={files} refreshKey={refreshKey} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* PROMPT BAR — bottom */}
        <div className="pbar">
          <div className={`pinner ${loading?"pinner--loading":""}`}>
            <span className="picon">⌘</span>
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key==="Enter" && handleGenerate()}
              placeholder="Describe the site you want to build…"
              disabled={loading}
              className="pinput"
            />
            {!files && !loading && (
              <div className="pchips">
                {SUGGESTIONS.slice(0,2).map(s => <button key={s} onClick={() => setPrompt(s)} className="pchip">{s}</button>)}
              </div>
            )}
            <button onClick={handleGenerate} disabled={loading||!prompt.trim()} className="gbtn">
              {loading ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Building
                </>
              ) : files ? "Rebuild ↵" : "Generate ↵"}
            </button>
          </div>
          {error && <div className="errbar"><span>✕</span>{error}</div>}
        </div>

      </div>
    </>
  );
}