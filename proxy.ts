import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'


const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/(.*)',
])
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    // const { userId } = await auth()

    // if (!userId) {
    //   const signInUrl = new URL('/sign-up', req.url)
    //   return NextResponse.redirect(signInUrl)
    // }
    (await auth()).redirectToSignIn()
  }
})


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}