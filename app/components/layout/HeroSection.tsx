"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");

  const logos = ["▲", "◆", "✦", "▲", "◆"];

  return (
    <section className="bg-[radial-gradient(circle_400px,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.23)_30%,rgba(14,15,28,1)_100%)] min-h-[90vh] flex flex-col relative">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-28 pb-20">
        {/* Badge */}
        {/* <div className="flex items-center gap-2 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>
          <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">
            V2.0 NOW ARCHITECTING
          </span>
        </div> */}

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold text-white leading-tighter max-w-2xl mx-auto tracking-tighter">
          Build the Future of the{" "}
          <br />
          <span className="bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Web with AI</span>
        </h1>

        {/* Subheading */}
        <p className="mt-2 text-gray-200 text-sm sm:text-md max-w-md mx-auto leading-tighter">
          The luminescent architect for your digital dreams. Generate, deploy, and scale
          high-performance interfaces from a single prompt.
        </p>

        {/* Prompt Input */}
        <div className="mt-5 w-full max-w-xl">
          {/* <div className="flex items-center bg-[#161b27] border border-white/10 rounded-xl px-4 py-3 gap-3 shadow-lg shadow-black/40">
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
          </div> */}
          <Link href={"/start-building"} className=" bg-linear-to-r from-[#3b83f677] to-[#3B82F6] hover:bg-[#3B82F6] hover:scale-110 text-white text-md px-5 py-2 rounded-full transition-colors duration-200 hover:cursor-pointer">
            Start Building
          </Link>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-200">
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
        <div className="">

             <p className=" absolute bottom-4 left-1/2 transform -translate-x-1/2  text-center text-xs text-gray-200  uppercase tracking-widest underline">
          Empowering the Next Generation of Architects
        </p>
          <hr />
        </div>
      </div>
    </section>
  );
}