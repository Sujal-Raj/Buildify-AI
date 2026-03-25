'use client'
import { Show, SignIn, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
// import { currentUser } from '@clerk/nextjs/server'

export default function Navbar(){
  // const user = await currentUser();
  // console.log(user?.id)
  // console.log(user?.emailAddresses[0].emailAddress)
  // console.log(user?.firstName)
  const { user, isLoaded } = useUser();

  useEffect(() => {
  if (!isLoaded || !user) return;

  fetch('/api/users/sync-user', {
    method: 'POST',
  });
}, [user, isLoaded]);

    return (
        <>
        <h1>Buildify AI</h1>
        <Show when="signed-out">
              <SignInButton />
              {/* <SignUpButton>
                <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton> */}
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
        </>
    )
}