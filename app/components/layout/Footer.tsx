"use client";

export default function Footer() {
  return (
    <>
      {/* CTA Section */}
      <section className="bg-[#0d1117] py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#111827] border border-white/8 rounded-3xl px-6 sm:px-12 py-16 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-lg mx-auto">
              Ready to Architect Your Future?
            </h2>
            <p className="mt-5 text-gray-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Join 10,000+ creators building the next generation of the web with Buildify AI.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#"
                className="bg-white hover:bg-gray-100 text-gray-900 font-semibold text-sm px-7 py-2.5 rounded-full transition-colors w-full sm:w-auto text-center"
              >
                Start Building Now
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
              >
                View Templates
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d1117] border-t border-white/5 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div>
            <p className="text-white font-bold text-base">Buildify AI</p>
            <p className="text-gray-600 text-xs mt-1">
              © 2024 BUILDIFY AI. ARCHITECTING THE DIGITAL FUTURE.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "Changelog", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-gray-500 hover:text-gray-300 text-xs uppercase tracking-wider transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}