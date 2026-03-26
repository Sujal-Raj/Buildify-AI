'use client'
import { Show, SignIn, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
// import { currentUser } from '@clerk/nextjs/server'

export default function Navbar(){
  // const user = await currentUser();
  // console.log(user?.id)
  // console.log(user?.emailAddresses[0].emailAddress)
  // console.log(user?.firstName)
  const { user, isLoaded } = useUser();

  const navLinks = ["Product", "Features", "Templates", "Pricing"] as const;
  const [active, setActive] = useState<string>("Product");
  const [menuOpen, setMenuOpen] = useState(false);

//   useEffect(() => {
//   if (!isLoaded || !user) return;

//   fetch('/api/users/sync-user', {
//     method: 'POST',
//   });
// }, [user, isLoaded]);


  //font-['Plus_Jakarta_Sans']
  // bg-white dark:bg-[#0e0f1c]
  //         border-b border-[#e2e4f0] dark:border-[#2a2b45]
    return (
        <>
        {/* <h1>Buildify AI</h1> */}
        <nav className="
          w-full
          bg-white dark:bg-[#0e0f1c]
          px-6 md:px-8 py-4
          flex items-center justify-between
          max-h-[10vh]
          relative z-50
        ">

          {/* Logo */}
          <div className="flex items-center gap-1 text-[#0e0f1c] dark:text-white font-bold text-xl tracking-tight select-none">
            <span>Buildify</span>
            <span className="text-[#7c6af7]">AI</span>
          </div>

          {/* Nav Links — hidden on mobile, visible md+ */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link}>
                <button
                  onClick={() => setActive(link)}
                  className={`relative text-sm font-medium pb-1 transition-colors duration-200
                    ${
                      active === link
                        ? "text-[#0e0f1c] dark:text-white"
                        : "text-gray-500 dark:text-gray-400 hover:text-[#0e0f1c] dark:hover:text-white"
                    }
                  `}
                >
                  {link}
                  {active === link && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#0e0f1c] dark:bg-white rounded-full" />
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Right side: auth + hamburger */}
          <div className="flex items-center gap-4">

            {/* Auth buttons — hidden on mobile */}
            <div className="hidden md:flex items-center gap-4">
              <Show when="signed-out">
                {/* <SignInButton /> */}
                <SignInButton>
                  <button className="bg-gradient-to-r from-[#3b83f677] to-[#3B82F6] hover:brightness-110 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200 border border-[#3B82F6]/40 hover:cursor-pointer shadow-sm">
                    Get Started
                  </button>
                </SignInButton>
                {/* <SignUpButton>
                  <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton> */}
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>

            {/* Hamburger button — visible on mobile only */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] group"
              aria-label="Toggle menu"
            >
              <span className={`block h-[2px] w-5 rounded-full transition-all duration-300 bg-[#0e0f1c] dark:bg-white
                ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`}
              />
              <span className={`block h-[2px] w-5 rounded-full transition-all duration-300 bg-[#0e0f1c] dark:bg-white
                ${menuOpen ? "opacity-0 scale-x-0" : ""}`}
              />
              <span className={`block h-[2px] w-5 rounded-full transition-all duration-300 bg-[#0e0f1c] dark:bg-white
                ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}
              />
            </button>

          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out
          bg-white dark:bg-[#0e0f1c]
          border-b border-[#e2e4f0] dark:border-[#2a2b45]
          font-['Plus_Jakarta_Sans']
          ${menuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}
        `}>
          <ul className="flex flex-col px-6 pt-2 pb-4 gap-1">
            {navLinks.map((link) => (
              <li key={link}>
                <button
                  onClick={() => { setActive(link); setMenuOpen(false); }}
                  className={`w-full text-left text-sm font-medium py-3 px-2 rounded-lg transition-colors duration-200
                    ${
                      active === link
                        ? "text-[#7c6af7] bg-[#7c6af7]/10"
                        : "text-gray-500 dark:text-gray-400 hover:text-[#0e0f1c] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                    }
                  `}
                >
                  {link}
                </button>
              </li>
            ))}
          </ul>

          {/* Mobile auth */}
          <div className="px-6 pb-5">
            <Show when="signed-out">
              {/* <SignInButton /> */}
              <SignInButton>
                <button className="w-full bg-gradient-to-r from-[#3b83f677] to-[#3B82F6] hover:brightness-110 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 border border-[#3B82F6]/40 hover:cursor-pointer shadow-sm">
                  Get Started
                </button>
              </SignInButton>
              {/* <SignUpButton>
                <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton> */}
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </div>
        </>
    )
}