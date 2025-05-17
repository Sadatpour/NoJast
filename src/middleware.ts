import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimit } from './middleware/rate-limit'
import { logger } from '@/lib/logger'

export async function middleware(request: NextRequest) {
  // اعمال محدودیت نرخ درخواست
  const rateLimitResult = rateLimit(request)
  if (rateLimitResult) {
    return rateLimitResult
  }

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

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Log current path for debugging
    logger.debug(`Middleware processing path: ${request.nextUrl.pathname}`)

    // Special case for admin test page - allow access to any logged-in user
    if (request.nextUrl.pathname === '/admin/debug/admin-test') {
      logger.debug('Special case: admin debug test page')
      
      if (!user) {
        // Not logged in, redirect to login
        logger.info('Not logged in, redirecting to login')
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
      }
      
      // User is logged in, allow access to test page
      logger.info('User is logged in, allowing access to test page')
      return supabaseResponse
    }

    // Admin route protection for all other admin routes
    if (user && request.nextUrl.pathname.startsWith('/admin')) {
      logger.debug('Checking admin access for path:', request.nextUrl.pathname)
      
      // Check if user is admin
      const { data: profile } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      logger.debug('Admin check result:', profile)

      if (!profile?.is_admin) {
        // User is not an admin, redirect to homepage
        logger.warn('User is not admin, redirecting to homepage')
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
      logger.info('No user, redirecting to login page')
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Allow access to all other routes
    logger.debug('Middleware complete, allowing access')
    return supabaseResponse
  } catch (error) {
    logger.error('Error in middleware:', error)
    return NextResponse.redirect(new URL('/error', request.url))
  }
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