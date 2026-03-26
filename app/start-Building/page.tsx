'use client'

import axios from "axios";
import { useState, useEffect, useRef } from "react"

// Typing animation for file content
function useTypewriter(text: string, speed = 12, active = false) {
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

const FILE_ICONS: Record<string, string> = {
  "jsx": "⚛",
  "js": "JS",
  "css": "✦",
  "ts": "TS",
  "tsx": "⚛",
  "html": "◇",
};

function getExt(name: string) {
  return name.split(".").pop() || "";
}

function FileTab({ name, active, onClick }: { name: string, active: boolean, onClick: () => void }) {
  const ext = getExt(name);
  const icon = FILE_ICONS[ext] || "◈";
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono border-r border-white/5 transition-all duration-200 whitespace-nowrap ${
        active
          ? "bg-white/5 text-white border-b-2 border-b-blue-400"
          : "text-gray-500 hover:text-gray-300 hover:bg-white/3"
      }`}
    >
      <span className={`text-[10px] ${active ? "text-blue-400" : "text-gray-600"}`}>{icon}</span>
      {name}
    </button>
  );
}

function CodeBlock({ code, animating }: { code: string; animating: boolean }) {
  const displayed = useTypewriter(code, 6, animating);
  const content = animating ? displayed : code;

  // Syntax highlight lines
  const lines = content.split("\n");

  return (
    <div className="font-mono text-xs leading-6 text-gray-300 whitespace-pre overflow-auto h-full">
      {lines.map((line, i) => (
        <div key={i} className="flex group">
          <span className="select-none w-8 text-right pr-3 text-gray-600 group-hover:text-gray-500 shrink-0 text-[10px] leading-6">
            {i + 1}
          </span>
          <span className="flex-1">{line}</span>
        </div>
      ))}
      {animating && (
        <span className="inline-block w-1.5 h-4 bg-blue-400 ml-1 animate-pulse align-middle" />
      )}
    </div>
  );
}

const SUGGESTIONS = [
  "Modern SaaS landing page",
  "AI portfolio with glassmorphism",
  "Dashboard with dark theme",
  "E-commerce product card",
];

export default function StartBuildingPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<Record<string, string> | null>(null);
  const [activeFile, setActiveFile] = useState<string>("");
  const [animatingFile, setAnimatingFile] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("Initializing...");
  const inputRef = useRef<HTMLInputElement>(null);

  const statusMessages = [
    "Thinking...",
    "Designing components...",
    "Writing JSX...",
    "Styling with Tailwind...",
    "Finalizing files...",
  ];

  useEffect(() => {
    if (!loading) return;
    let i = 0;
    setStatusMsg(statusMessages[0]);
    const interval = setInterval(() => {
      i = (i + 1) % statusMessages.length;
      setStatusMsg(statusMessages[i]);
    }, 1400);
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      inputRef.current?.focus();
      return;
    }
    setLoading(true);
    setFiles(null);
    setError(null);
    setActiveFile("");
    setAnimatingFile("");

    try {
      const response = await axios.post("/api/users/build", { prompt });
      const { files: generatedFiles } = response.data;

      if (!generatedFiles) throw new Error("No files returned");

      setFiles(generatedFiles);
      const firstFile = Object.keys(generatedFiles)[0];
      setActiveFile(firstFile);
      setAnimatingFile(firstFile);

      // Animate each file sequentially
      const fileKeys = Object.keys(generatedFiles);
      let delay = 0;
      for (const key of fileKeys) {
        const length = generatedFiles[key]?.length || 0;
        const duration = Math.max(length * 6, 800);
        setTimeout(() => {
          setActiveFile(key);
          setAnimatingFile(key);
        }, delay);
        delay += duration + 200;
      }

      setTimeout(() => setAnimatingFile(""), delay);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fileKeys = files ? Object.keys(files) : [];

  return (
    <section className="bg-[radial-gradient(circle_400px_at_50%_0%,rgba(59,130,246,0.08)_0%,rgba(14,15,28,1)_70%)] min-h-screen flex flex-col text-white">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 text-lg">✦</span>
          <span className="text-sm font-medium tracking-tight text-white/80">Architect</span>
        </div>
        <span className="text-xs text-gray-500 tracking-widest uppercase">Build Studio</span>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-start px-4 pt-14 pb-10">

        {/* Header */}
        {!files && !loading && (
          <div className="text-center mb-10 max-w-xl">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-1 h-1 rounded-full bg-blue-400 inline-block"></span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">AI-Powered Builder</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tighter leading-tight">
              Describe your{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                vision
              </span>
            </h1>
            <p className="mt-2 text-gray-400 text-sm">
              Turn a single prompt into a production-ready React + Tailwind project.
            </p>
          </div>
        )}

        {/* Input Area */}
        <div className={`w-full max-w-2xl transition-all duration-500 ${files || loading ? "mb-6" : "mb-8"}`}>
          <div className={`flex items-center gap-3 bg-[#0d0f1a] border rounded-xl px-4 py-3 shadow-xl shadow-black/40 transition-all duration-300 ${
            loading ? "border-blue-500/40" : "border-white/8 hover:border-white/15 focus-within:border-blue-500/50"
          }`}>
            <span className="text-gray-600 text-xs shrink-0">⌘</span>
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="Describe the site you want to build..."
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none disabled:opacity-50"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-all duration-200 shrink-0"
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Building
                </span>
              ) : (
                <>Generate ↵</>
              )}
            </button>
          </div>

          {/* Suggestions */}
          {!files && !loading && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-600">Try:</span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="text-xs text-gray-500 hover:text-gray-200 border border-white/5 hover:border-white/15 px-2.5 py-1 rounded-lg transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="w-full max-w-2xl mb-4 flex items-center gap-2 bg-red-950/30 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg">
            <span>✕</span> {error}
          </div>
        )}

        {/* Loading State */}
        {loading && !files && (
          <div className="w-full max-w-2xl">
            <div className="bg-[#0a0c18] border border-white/6 rounded-xl overflow-hidden">
              {/* Fake tab bar */}
              <div className="flex items-center border-b border-white/5 px-4 py-2.5 gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10"></span>
                </div>
                <div className="flex gap-2">
                  {["App.jsx", "index.js", "styles.css"].map(f => (
                    <div key={f} className="h-5 w-16 bg-white/5 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
              {/* Fake code lines */}
              <div className="p-5 space-y-2">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-3 bg-white/4 rounded animate-pulse"
                    style={{
                      width: `${30 + Math.sin(i * 1.7) * 20 + Math.random() * 30}%`,
                      animationDelay: `${i * 60}ms`,
                      marginLeft: i % 3 === 0 ? "0" : i % 3 === 1 ? "16px" : "32px",
                    }}
                  />
                ))}
              </div>
              {/* Status */}
              <div className="border-t border-white/5 px-5 py-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                <span className="text-xs text-blue-300/70 font-mono transition-all duration-300">{statusMsg}</span>
              </div>
            </div>
          </div>
        )}

        {/* Files Editor */}
        {files && fileKeys.length > 0 && (
          <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header row */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                <span className="text-xs text-gray-400">{fileKeys.length} file{fileKeys.length !== 1 ? "s" : ""} generated</span>
              </div>
              <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">React + Tailwind</span>
            </div>

            <div className="bg-[#080a15] border border-white/7 rounded-xl overflow-hidden shadow-2xl shadow-black/60">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0a0c1a]">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60"></span>
                <div className="ml-2 flex-1 bg-white/4 rounded text-[10px] text-gray-600 px-3 py-0.5 font-mono max-w-xs">
                  ✦ architect / {prompt.slice(0, 30)}{prompt.length > 30 ? "…" : ""}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex overflow-x-auto border-b border-white/5 bg-[#090b18] scrollbar-none">
                {fileKeys.map((name) => (
                  <FileTab
                    key={name}
                    name={name}
                    active={activeFile === name}
                    onClick={() => setActiveFile(name)}
                  />
                ))}
              </div>

              {/* Code area */}
              <div className="p-5 overflow-auto max-h-[480px] min-h-[280px]">
                {activeFile && files[activeFile] !== undefined ? (
                  <CodeBlock
                    code={files[activeFile]}
                    animating={animatingFile === activeFile}
                  />
                ) : (
                  <span className="text-gray-600 text-xs font-mono">Select a file</span>
                )}
              </div>

              {/* Status bar */}
              <div className="border-t border-white/5 px-5 py-2 flex items-center justify-between bg-[#090b18]">
                <div className="flex items-center gap-3">
                  {animatingFile ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                      <span className="text-[10px] text-blue-300/70 font-mono">Writing {animatingFile}...</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                      <span className="text-[10px] text-green-300/60 font-mono">Ready</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-600 font-mono">
                  <span>{getExt(activeFile).toUpperCase()}</span>
                  <span>{files[activeFile]?.split("\n").length ?? 0} lines</span>
                </div>
              </div>
            </div>

            {/* Regenerate */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => { setFiles(null); setActiveFile(""); setTimeout(() => inputRef.current?.focus(), 100); }}
                className="text-xs text-gray-500 hover:text-gray-300 border border-white/5 hover:border-white/10 px-4 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5"
              >
                ↺ Start over
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-gray-600 uppercase tracking-widest pb-4">
        Empowering the Next Generation of Architects
      </p>
    </section>
  );
}