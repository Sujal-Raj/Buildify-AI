"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");

  const logos = ["▲", "◆", "✦", "▲", "◆"];

  return (
    <section className="bg-[#0d1117] min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-28 pb-20">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>
          <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">
            V2.0 NOW ARCHITECTING
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight max-w-2xl mx-auto">
          Build the Future of the{" "}
          <span className="text-blue-400">Web with AI</span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-gray-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          The luminescent architect for your digital dreams. Generate, deploy, and scale
          high-performance interfaces from a single prompt.
        </p>

        {/* Prompt Input */}
        <div className="mt-10 w-full max-w-xl">
          <div className="flex items-center bg-[#161b27] border border-white/10 rounded-xl px-4 py-3 gap-3 shadow-lg shadow-black/40">
            <svg
              className="w-4 h-4 text-gray-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the site you want to build..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
            />
            <button className="bg-blue-500 hover:bg-blue-400 transition-colors text-white text-sm font-medium px-5 py-1.5 rounded-lg flex-shrink-0">
              Generate
            </button>
          </div>

          {/* Try suggestions */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
            <span>Try:</span>
            {['"Modern SaaS landing page"', '"AI Portfolio with glassmorphism"'].map((s) => (
              <button
                key={s}
                onClick={() => setPrompt(s.replace(/"/g, ""))}
                className="hover:text-gray-300 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logo Bar */}
      <div className="border-t border-white/5 py-10 px-4">
        <p className="text-center text-xs text-gray-600 uppercase tracking-widest mb-8">
          Empowering the Next Generation of Architects
        </p>
        <div className="flex items-center justify-center gap-10 sm:gap-16 flex-wrap">
          {logos.map((logo, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-lg bg-[#161b27] border border-white/10 flex items-center justify-center text-gray-500 text-lg"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}