"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <>
      {/* CTA Section */}
      <section className="bg-[#0e0f1c] py-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Radial background effect to match Home Hero */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_50%,rgba(59,130,246,0.1),transparent)] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-[2.5rem] px-6 sm:px-12 py-20 text-center shadow-2xl shadow-black/50">
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tighter max-w-2xl mx-auto">
              Ready to Architect Your{" "}
              <span className="bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Digital Future?
              </span>
            </h2>
            <p className="mt-6 text-gray-300 text-sm sm:text-md max-w-md mx-auto leading-relaxed">
              Join 10,000+ creators building high-performance interfaces from a single prompt with Buildify AI.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                href="/start-building" 
                className="bg-linear-to-r from-[#3b83f677] to-[#3B82F6] hover:scale-105 text-white font-medium text-md px-8 py-3 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/20"
              >
                Start Building Now
              </Link>
              {/* <a
                href="#"
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                View Templates 
                <span className="text-xs">→</span>
              </a> */}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0e0f1c] border-t border-white/10 px-4 sm:px-6 py-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand & Copyright */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="text-blue-400 text-xl">✦</span>
              <p className="text-white font-bold text-lg tracking-tight">Buildify AI</p>
            </div>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-medium">
              © 2024 ARCHITECTING THE DIGITAL FUTURE.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {["Privacy Policy", "Terms", "Changelog", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-gray-400 hover:text-blue-400 text-[11px] uppercase tracking-widest transition-colors font-medium"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Decorative Social/Status Indicator */}
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
             <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
             <span className="text-[10px] text-gray-400 uppercase tracking-tighter">System Operational</span>
          </div>
        </div>
      </footer>
    </>
  );
}