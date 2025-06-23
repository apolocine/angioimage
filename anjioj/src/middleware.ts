import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignorer les fichiers statiques et les API d'auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') // fichiers avec extension
  ) {
    return NextResponse.next()
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })

  console.log('Middleware - pathname:', pathname, 'token:', !!token)

  // Routes publiques
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Routes API protégées (hors auth)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Si connecté et on essaie d'accéder aux pages auth
  if (token && isPublicRoute) {
    console.log('Redirection vers dashboard car déjà connecté')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Si pas connecté et on essaie d'accéder aux pages protégées
  if (!token && !isPublicRoute) {
    console.log('Redirection vers login car pas connecté')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ]
}