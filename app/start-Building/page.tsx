'use client'

import axios from "axios";
import { useState, useEffect, useRef, useCallback } from "react"
import { Sandpack } from "@codesandbox/sandpack-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
}

// ─── Typewriter hook ─────────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
const FILE_ICONS: Record<string, { icon: string; color: string }> = {
  jsx: { icon: "⚛", color: "text-sky-400" },
  js:  { icon: "JS", color: "text-yellow-400" },
  css: { icon: "✦", color: "text-pink-400" },
  ts:  { icon: "TS", color: "text-blue-400" },
  tsx: { icon: "⚛", color: "text-sky-400" },
  html:{ icon: "◇", color: "text-orange-400" },
};
function getExt(name: string) { return name.split(".").pop() || ""; }
function getFileIcon(name: string) {
  return FILE_ICONS[getExt(name)] ?? { icon: "◈", color: "text-slate-400" };
}
function uid() { return Math.random().toString(36).slice(2); }

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

// ─── Highlighted Code ────────────────────────────────────────────────────────
function HighlightedCode({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <div className="flex text-xs leading-5 font-mono min-h-full">
      <div className="select-none text-right px-3 pt-4 pb-4 text-slate-600 dark:text-slate-600 bg-[#13131a] flex-shrink-0 min-w-[44px] border-r border-white/5">
        {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
      </div>
      <div className="flex-1 pt-4 pb-4 px-4 overflow-x-auto">
        {lines.map((line, i) => (
          <div key={i} className="whitespace-pre min-h-[20px]">
            {tokenize(line).map((tok, j) => (
              <span key={j} className={tok.cls}>{tok.text}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Code Editor ─────────────────────────────────────────────────────────────
function CodeEditor({ code, animating, onChange }: {
  code: string; animating: boolean; onChange: (v: string) => void
}) {
  const displayed = useTypewriter(code, 4, animating);
  const value = animating ? displayed : code;
  return (
    <div className="relative min-h-full flex flex-col">
      <HighlightedCode code={value} />
      {!animating && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="absolute inset-0 bg-transparent text-transparent caret-sky-400 border-none outline-none resize-none text-xs leading-5 font-mono pt-4 pb-4 pl-[56px] pr-4 whitespace-pre overflow-hidden z-10 scrollbar-none"
          aria-label="Code editor"
        />
      )}
      {animating && (
        <span className="absolute bottom-4 left-14 w-0.5 h-3.5 bg-sky-400 rounded-sm animate-pulse z-10" />
      )}
    </div>
  );
}

// ─── Preview Panel ────────────────────────────────────────────────────────────
// function PreviewPanel({ files, refreshKey }: { files: Record<string, string>; refreshKey: number }) {
//   const appCode = files["App.jsx"] || files["App.js"] || Object.values(files)[0] || "";
//   const cssCode = files["styles.css"] || files["index.css"] || "";
//   return (
//     <div key={refreshKey} className="w-full h-full flex flex-col [&_.sp-wrapper]:h-full [&_.sp-wrapper]:flex-1 [&_.sp-layout]:h-full! [&_.sp-layout]:border-none! [&_.sp-layout]:rounded-none! [&_.sp-preview]:flex-1! [&_.sp-preview]:h-full! [&_.sp-preview-container]:h-full! [&_iframe]:w-full! [&_iframe]:h-full! [&_iframe]:border-none! [&_.sp-editor]:hidden! [&_.sp-code-editor]:hidden! [&_.cm-editor]:hidden! [&_.sp-tabs]:hidden! [&_.sp-navigator]:hidden! [&_.sp-preview-actions]:hidden!">
//       <Sandpack
//         template="react"
//         theme="light"
//         options={{
//           showNavigator: false,
//           showTabs: false,
//           showLineNumbers: false,
//           showInlineErrors: true,
//           wrapContent: true,
//           layout: "preview",
//           editorHeight: 0,
//         }}
//         // files={{
//         //   "/App.js": appCode,
//         //   "/index.js": `import React from "react"; import { createRoot } from "react-dom/client"; import App from "./App"; import "./styles.css"; createRoot(document.getElementById("root")).render(<App />);`,
//         //   "/styles.css": cssCode,
//         // }}
//         files={{ "/App.js": appCode, "/index.js": `import React from "react"; import { createRoot } from "react-dom/client"; import App from "./App"; import "./styles.css"; createRoot(document.getElementById("root")).render();`, "/styles.css": cssCode, 
//         "/public/index.html": `<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <script src="https://cdn.tailwindcss.com"></script> </head> <body> <div id="root"></div> </body> </html>`, }}
//       />
//     </div>
//   );
// }


function PreviewPanel({ files, refreshKey }: { files: Record<string, string>; refreshKey: number }) {
  const appCode  = files["src/App.jsx"] || files["App.jsx"] || Object.values(files)[0] || "";
  const cssCode  = files["src/index.css"] || "";

  return (
    <div
      key={refreshKey}
      className="w-full h-full flex flex-col [&_.sp-wrapper]:h-full [&_.sp-wrapper]:flex-1 [&_.sp-layout]:h-full! [&_.sp-layout]:border-none! [&_.sp-layout]:rounded-none! [&_.sp-preview]:flex-1! [&_.sp-preview]:h-full! [&_.sp-preview-container]:h-full! [&_iframe]:w-full! [&_iframe]:h-full! [&_iframe]:border-none! [&_.sp-editor]:hidden! [&_.sp-code-editor]:hidden! [&_.cm-editor]:hidden! [&_.sp-tabs]:hidden! [&_.sp-navigator]:hidden! [&_.sp-preview-actions]:hidden!"
    >
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
          "/public/index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>App</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
          "/src/main.jsx": `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
          "/src/index.css": cssCode,
          "/src/App.jsx": appCode,
        }}
        customSetup={{
          entry: "/src/main.jsx",
        }}
      />
    </div>
  );
}

// ─── Folder Tree Node ─────────────────────────────────────────────────────────
function FolderTree({
  files,
  activeFile,
  onSelect,
}: {
  files: Record<string, string>;
  activeFile: string;
  onSelect: (name: string) => void;
}) {
  const keys = Object.keys(files);

  const folders = [
    ...new Set(
      Object.keys(files).map((k) =>
        k.includes("/") ? k.split("/")[0] : "root"
      )
    ),
  ];

  return (
    <div className="p-2 space-y-0.5">
      {/* folders */}
      {folders.map((folder) => (
        <div
          key={folder}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-500 dark:text-slate-500"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
            />
          </svg>
          <span className="font-medium">{folder}</span>
        </div>
      ))}

      {/* files */}
      {keys.map((name) => {
        const { icon, color } = getFileIcon(name);
        const active = activeFile === name;

        return (
          <button
            key={name}
            onClick={() => onSelect(name)}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-100 group
              ${
                active
                  ? "bg-sky-500/15 text-sky-300 dark:text-sky-300"
                  : "text-slate-500 dark:text-slate-500 hover:bg-white/5 hover:text-slate-300 dark:hover:text-slate-300"
              }`}
          >
            <span
              className={`text-[10px] font-bold flex-shrink-0 w-4 text-center ${
                active ? "text-sky-400" : color
              } group-hover:opacity-100`}
            >
              {icon}
            </span>

            <span className="truncate">{name}</span>

            {active && (
              <div className="ml-auto w-1 h-1 rounded-full bg-sky-400 flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Skeleton Folder Tree ─────────────────────────────────────────────────────
function SkeletonTree() {
  return (
    <div className="p-3 space-y-2">
      {[60, 80, 70, 90, 65].map((w, i) => (
        <div
          key={i}
          className="h-7 rounded-md bg-white/5 animate-pulse"
          style={{ animationDelay: `${i * 0.1}s`, width: `${w}%` }}
        />
      ))}
    </div>
  );
}

// ─── Chat Message ─────────────────────────────────────────────────────────────
function ChatMessage({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5
        ${isUser
          ? "bg-sky-500 text-white"
          : "bg-[#1e1e2e] border border-white/10 text-slate-400"
        }`}
      >
        {isUser ? "U" : "✦"}
      </div>

      <div className={`max-w-[80%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed
          ${isUser
            ? "bg-sky-500 text-white rounded-tr-sm"
            : "bg-[#1e1e2e] border border-white/8 text-slate-300 rounded-tl-sm"
          }
          ${msg.isGenerating ? "animate-pulse" : ""}
        `}>
          {msg.isGenerating ? (
            <div className="flex items-center gap-1.5">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-slate-500 text-xs">{msg.content}</span>
            </div>
          ) : msg.content}
        </div>
        <span className="text-[10px] text-slate-600 px-1">
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-3">
        <span className="text-sky-400 text-lg">✦</span>
      </div>
      <h3 className="text-sm font-semibold text-slate-300 mb-1">Start building</h3>
      <p className="text-xs text-slate-600 leading-relaxed max-w-[160px]">
        Describe the UI you want and I'll generate it instantly.
      </p>
    </div>
  );
}

// ─── Empty Code Panel ─────────────────────────────────────────────────────────
function EmptyCodePanel() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-6">
      <div className="w-12 h-12 rounded-xl border border-white/8 bg-white/3 flex items-center justify-center">
        <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">No code yet</p>
        <p className="text-xs text-slate-700 mt-0.5">Generated code will appear here</p>
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "SaaS dashboard with dark theme",
  "AI portfolio with glassmorphism",
  "E-commerce product card",
  "Login page with social auth",
];

const STATUS_MSGS = ["Thinking…", "Designing…", "Writing JSX…", "Styling…", "Finalizing…"];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StartBuildingPage() {
  // Chat
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [statusMsg, setStatusMsg]       = useState(STATUS_MSGS[0]);
  const [error, setError]               = useState<string | null>(null);
  const messagesEndRef                  = useRef<HTMLDivElement>(null);
  const inputRef                        = useRef<HTMLTextAreaElement>(null);

  // Code
  const [files, setFiles]               = useState<Record<string, string> | null>(null);
  const [currentAppCode, setCurrentAppCode] = useState<string>("");
  const [activeFile, setActiveFile]     = useState<string>("");
  const [animatingFile, setAnimating]   = useState<string>("");
  const [refreshKey, setRefreshKey]     = useState(0);

  // Panel
  const [codeTab, setCodeTab]           = useState<"code" | "preview">("code");

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Status cycling
  useEffect(() => {
    if (!loading) return;
    let i = 0; setStatusMsg(STATUS_MSGS[0]);
    const id = setInterval(() => { i = (i + 1) % STATUS_MSGS.length; setStatusMsg(STATUS_MSGS[i]); }, 1400);
    return () => clearInterval(id);
  }, [loading]);

  const addMessage = (role: Message["role"], content: string, extra?: Partial<Message>) => {
    const msg: Message = { id: uid(), role, content, timestamp: new Date(), ...extra };
    setMessages(prev => [...prev, msg]);
    return msg.id;
  };

  const updateMessage = (id: string, content: string, extra?: Partial<Message>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, content, ...extra } : m));
  };

  const handleSend = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    setInput("");
    setError(null);
    setLoading(true);

    // Add user message
    addMessage("user", prompt);

    const isFollowUp = messages.length > 0 && !!currentAppCode;

    // Add assistant thinking message
    const assistantMsgId = addMessage("assistant",
      isFollowUp ? "Updating your component…" : "Generating your UI…",
      { isGenerating: true }
    );

    try {
      const res = await axios.post("/api/users/build", {
        prompt,
        isFollowUp,
        previousCode: isFollowUp ? currentAppCode : undefined,
      });

      const generated: Record<string, string> = res.data.files;
      if (!generated) throw new Error("No files returned");

      const newAppCode = generated["App.jsx"] || generated["App.js"] || "";
      setCurrentAppCode(newAppCode);
      setFiles(generated);

      const keys = Object.keys(generated);
      setActiveFile(keys[0]);
      setAnimating(keys[0]);

      // Animate through files
      let delay = 0;
      for (const key of keys) {
        const dur = Math.max((generated[key]?.length || 0) * 4, 600);
        setTimeout(() => { setActiveFile(key); setAnimating(key); }, delay);
        delay += dur + 150;
      }
      setTimeout(() => {
        setAnimating("");
        setRefreshKey(k => k + 1);
      }, delay);

      updateMessage(assistantMsgId,
        isFollowUp
          ? `Done! I've updated your component based on your feedback. ${keys.length} file${keys.length > 1 ? 's' : ''} modified.`
          : `Your UI is ready! Generated ${keys.length} file${keys.length > 1 ? 's' : ''}. You can edit the code directly or ask me to make changes.`,
        { isGenerating: false }
      );

    } catch {
      updateMessage(assistantMsgId, "Something went wrong. Please try again.", { isGenerating: false });
      setError("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, currentAppCode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (s: string) => {
    setInput(s);
    inputRef.current?.focus();
  };

  const updateFile = useCallback((content: string) => {
    if (!activeFile || !files) return;
    setFiles(prev => prev ? { ...prev, [activeFile]: content } : prev);
    if (activeFile === "App.jsx" || activeFile === "App.js") {
      setCurrentAppCode(content);
    }
  }, [activeFile, files]);

  const fileKeys = files ? Object.keys(files) : [];
  const hasFiles = fileKeys.length > 0;

  // Copy to clipboard
  const handleCopy = () => {
    if (activeFile && files?.[activeFile]) {
      navigator.clipboard.writeText(files[activeFile]);
    }
  };

  // Download file
  const handleDownload = () => {
    if (!activeFile || !files?.[activeFile]) return;
    const blob = new Blob([files[activeFile]], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = activeFile; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>{`
        /* Token colors - Catppuccin Mocha */
        .tok-keyword   { color: #cba6f7; font-weight: 600; }
        .tok-string    { color: #a6e3a1; }
        .tok-comment   { color: #6c7086; font-style: italic; }
        .tok-number    { color: #fab387; }
        .tok-builtin   { color: #89dceb; }
        .tok-component { color: #89b4fa; font-weight: 500; }
        .tok-tag       { color: #94e2d5; }
        .tok-punct     { color: #89dceb; opacity: 0.7; }
        .tok-ident     { color: #cdd6f4; }
        .tok-ws        { color: transparent; }
        .tok-other     { color: #a6adc8; }

        .scrollbar-none { scrollbar-width: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }

        .scrollbar-thin { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

        textarea { scrollbar-width: none; }
        textarea::-webkit-scrollbar { display: none; }

        /* Force sandpack */
        .sp-host .sp-wrapper { height: 100% !important; }
        .sp-host .sp-layout  { height: 100% !important; border: none !important; border-radius: 0 !important; }
        .sp-host .sp-preview { flex: 1 !important; height: 100% !important; }
        .sp-host .sp-preview-container { height: 100% !important; }
        .sp-host iframe { width: 100% !important; height: 100% !important; border: none !important; }
        .sp-host .sp-editor, .sp-host .sp-code-editor, .sp-host .cm-editor { display: none !important; }
        .sp-host .sp-tabs, .sp-host .sp-navigator, .sp-host .sp-preview-actions { display: none !important; }
      `}</style>

      {/* Root */}
      <div className="flex h-screen w-screen overflow-hidden bg-[#0d0d12] text-slate-200 font-['Berkeley_Mono','Fira_Code',ui-monospace,monospace]">

        {/* ── LEFT PANEL: Chat ────────────────────────────────────────────── */}
        <div className="flex flex-col w-[280px] min-w-[240px] max-w-[320px] border-r border-white/[0.06] bg-[#0f0f16] flex-shrink-0">

          {/* Chat Header */}
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-white/[0.06]">
            <div className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-[13px] font-semibold tracking-tight text-slate-200">Architect</span>
            <span className="ml-auto text-[9px] uppercase tracking-widest text-slate-600 border border-white/8 rounded-full px-2 py-0.5">Build</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-4">
            {messages.length === 0 ? (
              <EmptyChat />
            ) : (
              messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (only when empty) */}
          {messages.length === 0 && !loading && (
            <div className="px-3 pb-2 grid grid-cols-1 gap-1.5">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="text-left text-[11px] text-slate-500 hover:text-slate-300 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-lg px-3 py-2 transition-all duration-150 truncate"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-white/[0.06]">
            {error && (
              <div className="mb-2 flex items-center gap-2 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <span>✕</span><span>{error}</span>
              </div>
            )}
            <div className={`flex flex-col gap-2 bg-[#1a1a24] border rounded-xl p-3 transition-all duration-200
              ${loading ? "border-sky-500/40 shadow-[0_0_0_3px_rgba(14,165,233,0.08)]" : "border-white/[0.08] focus-within:border-sky-500/40 focus-within:shadow-[0_0_0_3px_rgba(14,165,233,0.08)]"}`}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={messages.length > 0 ? "Describe a change…" : "Describe the UI you want…"}
                disabled={loading}
                rows={3}
                className="bg-transparent text-[13px] text-slate-200 placeholder:text-slate-700 border-none outline-none resize-none font-[inherit] leading-relaxed disabled:opacity-40"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-700">↵ send · ⇧↵ newline</span>
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-white/10 disabled:text-slate-600 text-white text-[11px] font-semibold transition-all duration-150 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      {statusMsg.replace("…", "")}
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── MIDDLE PANEL: Folder Structure ──────────────────────────────── */}
        <div className="flex flex-col w-[160px] min-w-[140px] border-r border-white/[0.06] bg-[#0d0d12] flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-3.5 border-b border-white/[0.06]">
            <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Files</span>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-none">
            {loading && !hasFiles ? (
              <SkeletonTree />
            ) : hasFiles ? (
              <FolderTree
                files={files!}
                activeFile={activeFile}
                onSelect={(name) => {
                  setActiveFile(name);
                  setCodeTab("code");
                }}
              />
            ) : (
              <div className="p-4 text-center">
                <div className="text-slate-700 text-[10px] leading-relaxed">
                  Files will appear here after generation
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: Code / Preview ─────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 bg-[#13131a] overflow-hidden">

          {/* Code/Preview toolbar */}
          <div className="flex items-center justify-between px-4 border-b border-white/[0.06] bg-[#0f0f16] flex-shrink-0 h-[49px]">
            {/* Tab switcher */}
            <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-1 border border-white/[0.06]">
              {(["code", "preview"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setCodeTab(tab)}
                  className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all duration-150 capitalize
                    ${codeTab === tab
                      ? "bg-[#1e1e2e] text-slate-200 shadow-sm"
                      : "text-slate-600 hover:text-slate-400"
                    }`}
                >
                  {tab === "code" ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                      </svg>
                      Code
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Preview
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Active file pill */}
            {hasFiles && activeFile && codeTab === "code" && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-md">
                <span className={`text-[9px] font-bold ${getFileIcon(activeFile).color}`}>
                  {getFileIcon(activeFile).icon}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{activeFile}</span>
                {animatingFile === activeFile && (
                  <div className="w-1 h-1 rounded-full bg-sky-400 animate-pulse" />
                )}
              </div>
            )}

            {/* Actions: Download + Copy */}
            {hasFiles && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleDownload}
                  title="Download file"
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-slate-500 hover:text-slate-300 transition-all duration-150"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </button>
                <button
                  onClick={handleCopy}
                  title="Copy to clipboard"
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-slate-500 hover:text-slate-300 transition-all duration-150"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                </button>
                {codeTab === "preview" && (
                  <button
                    onClick={() => setRefreshKey(k => k + 1)}
                    title="Refresh preview"
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-slate-500 hover:text-slate-300 transition-all duration-150"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Code / Preview content */}
          <div className="flex-1 overflow-hidden relative">
            {/* Code View */}
            {codeTab === "code" && (
              <div className="absolute inset-0 overflow-auto scrollbar-thin bg-[#13131a]">
                {!hasFiles && !loading ? (
                  <EmptyCodePanel />
                ) : loading && !hasFiles ? (
                  // Skeleton lines
                  <div className="flex min-h-full">
                    <div className="w-11 bg-[#0f0f16] border-r border-white/5 flex-shrink-0" />
                    <div className="flex-1 p-5 space-y-3">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-3 rounded bg-white/[0.04] animate-pulse"
                          style={{
                            width: `${28 + Math.abs(Math.sin(i * 1.9)) * 40 + (i % 4) * 5}%`,
                            marginLeft: i % 3 === 0 ? 0 : i % 3 === 1 ? 16 : 32,
                            animationDelay: `${i * 0.04}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : hasFiles && activeFile && files![activeFile] !== undefined ? (
                  <CodeEditor
                    code={files![activeFile]}
                    animating={animatingFile === activeFile}
                    onChange={updateFile}
                  />
                ) : null}
              </div>
            )}

            {/* Preview View */}
            {codeTab === "preview" && (
              <div className="absolute inset-0 bg-white">
                {hasFiles ? (
                  <div className="sp-host w-full h-full">
                    <PreviewPanel files={files!} refreshKey={refreshKey} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-slate-50">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-500">No preview yet</p>
                      <p className="text-xs text-slate-400 mt-0.5">Generate a component to see the preview</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Loading overlay on preview */}
            {loading && hasFiles && codeTab === "preview" && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="flex items-center gap-2.5 bg-[#1e1e2e] border border-white/10 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 animate-spin text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  <span className="text-sm text-slate-300">{statusMsg}</span>
                </div>
              </div>
            )}
          </div>

          {/* Status bar */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t border-white/[0.06] bg-[#0f0f16]">
            <div className="flex items-center gap-2 text-[10px] text-slate-600">
              {animatingFile ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  <span>Writing {animatingFile}…</span>
                </>
              ) : hasFiles ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Ready · editable</span>
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  <span>Idle</span>
                </>
              )}
            </div>
            {hasFiles && activeFile && (
              <div className="flex items-center gap-3 text-[10px] text-slate-700">
                <span className="uppercase">{getExt(activeFile)}</span>
                <span>{files![activeFile]?.split("\n").length ?? 0} lines</span>
                {!animatingFile && (
                  <button
                    onClick={() => setRefreshKey(k => k + 1)}
                    className="text-sky-600 hover:text-sky-400 transition-colors"
                  >
                    ↺ run
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}