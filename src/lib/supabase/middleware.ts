import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
    
    // Allow the request to continue if env vars are missing (for development)
    // In production, you might want to return an error response
    return NextResponse.next({ request })
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch (error) {
    console.error('Invalid NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it possible for
  // unauthenticated users to access protected routes.

  // Define public paths that don't require authentication
  // Check this FIRST before any auth checks
  const publicPaths = [
    '/auth/login',
    '/auth/signup',
    '/auth/callback',
    '/auth/auth-code-error',
  ];
  
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  const isNextInternal = 
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp)$/);

  // Allow public paths and Next.js internals to pass through without auth check
  if (isPublicPath || isNextInternal) {
    // Still check auth for public paths to handle redirects, but don't block access
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Only redirect authenticated users away from auth pages (except callback)
    // This prevents logged-in users from seeing login/signup pages
    if (user && isPublicPath && !request.nextUrl.pathname.startsWith('/auth/callback')) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // Allow unauthenticated users to access public paths
    return supabaseResponse
  }

  // For protected paths, check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect unauthenticated users to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    // Preserve the original path for redirect after login
    url.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse
}

