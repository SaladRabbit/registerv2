// src/middleware.ts
// Replace the ENTIRE file with this:

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  // We keep this part.
  await supabase.auth.getSession()

  // --- ADDED: STATE MANAGEMENT "BOUNCER" LOGIC ---
  const { pathname } = request.nextUrl
  
  // Get the state we stored in our API route cookie
  const status = request.cookies.get('app_status')?.value;

  // Define our application pages
  const orientationPage = '/orientation';
  const basicInfoPage = '/basic-info';
  const completePage = '/complete';
  const homePage = '/'; // The page.tsx we've been editing

  // RULE 1: If user needs orientation, only allow them on the orientation page.
  if (status === 'ORIENTATION_REQUIRED' && pathname !== orientationPage) {
    // If they try to go to '/' or '/complete', force them to /orientation
    return NextResponse.redirect(new URL(orientationPage, request.url));
  }

  // RULE 2: If user needs to give basic info, only allow them on that page.
  if (status === 'NO_EMAIL_INFO_REQUIRED' && pathname !== basicInfoPage) {
    return NextResponse.redirect(new URL(basicInfoPage, request.url));
  }

  // RULE 3: If user is checked in, send them to the complete page.
  if (status === 'CHECKIN_COMPLETE' && pathname !== completePage) {
    // If they try to go back to '/' or '/orientation', force them to /complete
    return NextResponse.redirect(new URL(completePage, request.url));
  }
  
  // You would also add a rule to clear the cookie, e.g., on the /complete page
  // or after a certain amount of time.

  // If no rules match, continue as normal.
  return response
}

// --- CHANGED: Updated matcher ---
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * This is CRITICAL so the middleware doesn't run on your API routes.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}