"use client";

export default function About() {
  return (
    <section className="bg-[#0d1117] py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section Heading */}
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-xs">
            Precision Engineered Intelligence
          </h2>
          <div className="mt-3 w-10 h-0.5 bg-blue-500 rounded-full"></div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1 — Pure No-Code Freedom (large left) */}
          <div className="bg-[#111827] border border-white/8 rounded-2xl p-8 flex flex-col justify-between min-h-[260px]">
            <div>
              {/* Icon */}
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Pure No-Code Freedom</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Edit every pixel visually. Our AI interprets your creative intent and translates it
                into clean, semantic code automatically.
              </p>
            </div>
          </div>

          {/* Card 2 — AI-Powered Logic (right) */}
          <div className="bg-[#161b27] border border-white/8 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3l14 9-14 9V3z" />
              </svg>
              <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">AI-Powered Logic</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Beyond layouts, Buildify generates entire backends, API Integrations, and data structures
              with simple natural language.
            </p>
            {/* Generating Logic bar */}
            <div className="bg-[#0d1117] border border-white/10 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-xs text-gray-400">Generating Logic...</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full w-2/3 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Card 3 — Limitless Scalability (bottom left) */}
          <div className="bg-[#111827] border border-white/8 rounded-2xl p-8">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Limitless Scalability</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Built on top of global edge networks. Your sites load in milliseconds, regardless of
              traffic spikes or geographic location.
            </p>
          </div>

          {/* Card 4 — Seamless Ecosystem (bottom right) */}
          <div className="bg-[#111827] border border-white/8 rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-2">Seamless Ecosystem</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Connect your favorite tools. From Stripe to Shopify, Buildify AI bridges the gap
                between design and commerce.
              </p>
              <a
                href="#"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                Explore integrations
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            {/* Integration Icons */}
            <div className="flex gap-3 flex-shrink-0">
              {[
                <svg key="bag" className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
                <svg key="db" className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3M4 7v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7M4 7c0 1.657 3.582 3 8 3s8-1.343 8-3" /></svg>,
                <svg key="spark" className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3l14 9-14 9V3z" /></svg>,
              ].map((icon, i) => (
                <div
                  key={i}
                  className="w-11 h-11 rounded-xl bg-[#0d1117] border border-white/10 flex items-center justify-center"
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}