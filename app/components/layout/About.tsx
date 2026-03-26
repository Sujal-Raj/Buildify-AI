"use client";

export default function About() {
  return (
    <section className="bg-[#0e0f1c] py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Heading */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-[1px] bg-linear-to-r from-blue-400 to-transparent"></span>
            <span className="text-[10px] text-blue-400 uppercase tracking-[0.3em] font-bold">
              Engineering Excellence
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl  text-white leading-tight tracking-tighter max-w-md">
            Precision Engineered <br />
            <span className="bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Intelligence
            </span>
          </h2>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1 — Pure No-Code Freedom */}
          <div className="group bg-white/5 border border-white/10 hover:border-blue-500/30 backdrop-blur-md rounded-[2rem] p-8 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-xl mb-3 tracking-tight">Pure No-Code Freedom</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Edit every pixel visually. Our AI interprets your creative intent and translates it
              into clean, semantic code automatically.
            </p>
          </div>

          {/* Card 2 — AI-Powered Logic */}
          <div className="group bg-[#161b27]/40 border border-white/10 hover:border-purple-500/30 backdrop-blur-md rounded-[2rem] p-8 transition-all duration-300">
            <div className="flex items-center gap-2 mb-6">
               <span className="text-blue-400 text-lg">✦</span>
               <span className="text-purple-400 text-md">✦</span>
            </div>
            <h3 className="text-white font-bold text-xl mb-3 tracking-tight">AI-Powered Logic</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Beyond layouts, Buildify generates entire backends, API Integrations, and data structures
              with simple natural language.
            </p>
            {/* Logic Progress Bar UI */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">Architecting Logic</span>
                </div>
                <span className="text-[10px] text-blue-400 font-mono">67%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                <div className="bg-linear-to-r from-blue-500 to-purple-500 h-full w-2/3 transition-all duration-1000"></div>
              </div>
            </div>
          </div>

          {/* Card 3 — Limitless Scalability */}
          <div className="group bg-white/5 border border-white/10 hover:border-blue-400/30 backdrop-blur-md rounded-[2rem] p-8 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-xl mb-3 tracking-tight">Limitless Scalability</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Built on top of global edge networks. Your sites load in milliseconds, regardless of
              traffic spikes or geographic location.
            </p>
          </div>

          {/* Card 4 — Seamless Ecosystem */}
          <div className="group bg-white/5 border border-white/10 hover:border-blue-500/30 backdrop-blur-md rounded-[2rem] p-8 flex flex-col justify-between transition-all duration-300">
            <div>
              <h3 className="text-white font-bold text-xl mb-3 tracking-tight">Seamless Ecosystem</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Connect your favorite tools. From Stripe to Shopify, Buildify AI bridges the gap
                between design and commerce.
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <a href="#" className="text-[11px] text-blue-400 uppercase tracking-widest font-bold hover:text-white transition-colors">
                Explore integrations →
              </a>
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-[#0d1117] border border-white/10 flex items-center justify-center text-[10px] text-gray-500">
                    {i === 1 ? 'S' : i === 2 ? '◈' : '▲'}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}