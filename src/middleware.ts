import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Log current path for debugging
  console.log(`Middleware processing path: ${request.nextUrl.pathname}`)

  // Special case for admin test page - allow access to any logged-in user
  if (request.nextUrl.pathname === '/admin/debug/admin-test') {
    console.log('Special case: admin debug test page')
    
    if (!user) {
      // Not logged in, redirect to login
      console.log('Not logged in, redirecting to login')
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    
    // User is logged in, allow access to test page
    console.log('User is logged in, allowing access to test page')
    return supabaseResponse
  }

  // Admin route protection for all other admin routes
  if (user && request.nextUrl.pathname.startsWith('/admin')) {
    console.log('Checking admin access for path:', request.nextUrl.pathname)
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    console.log('Admin check result:', profile)

    if (!profile?.is_admin) {
      // User is not an admin, redirect to homepage
      console.log('User is not admin, redirecting to homepage')
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // General authentication protection
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/forgot-password') &&
    !request.nextUrl.pathname.startsWith('/reset-password') &&
    (request.nextUrl.pathname.startsWith('/dashboard') || 
     request.nextUrl.pathname.startsWith('/admin'))
  ) {
    // no user, potentially respond by redirecting the user to the login page
    console.log('No user, redirecting to login page')
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Allow access to all other routes
  console.log('Middleware complete, allowing access')
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 