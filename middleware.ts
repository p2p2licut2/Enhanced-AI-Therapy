import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { getToken } from 'next-auth/jwt';

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const isAuthenticated = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    
    // Redirecționare în funcție de starea autentificării
    if (isAuthPage) {
      if (isAuthenticated) {
        // Dacă utilizatorul este autentificat și încearcă să acceseze pagini de auth
        // redirecționăm către pagina principală
        return NextResponse.redirect(new URL('/', req.url));
      }
      // Permitem accesul la paginile de auth pentru utilizatorii neautentificați
      return NextResponse.next();
    }

    // Protejăm rutele care necesită autentificare
    const protectedPaths = [
      '/profile', 
      '/settings', 
      '/conversations'
    ];
    
    const isProtectedPath = protectedPaths.some(path => 
      req.nextUrl.pathname === path || 
      req.nextUrl.pathname.startsWith(`${path}/`)
    );

    if (isProtectedPath && !isAuthenticated) {
      // Redirecționăm către login cu returnTo pentru a reveni după autentificare
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Verificare pentru rute admin
    const adminPaths = ['/admin'];
    
    const isAdminPath = adminPaths.some(path => 
      req.nextUrl.pathname === path || 
      req.nextUrl.pathname.startsWith(`${path}/`)
    );
    
    if (isAdminPath && (!isAuthenticated || token?.role !== 'ADMIN')) {
      // Redirecționăm utilizatorii non-admin către pagina principală
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Verificare pentru email verificat
    const requiresVerifiedEmail = [
      '/settings/billing',
      '/settings/subscription'
    ];
    
    const needsVerifiedEmail = requiresVerifiedEmail.some(path => 
      req.nextUrl.pathname === path || 
      req.nextUrl.pathname.startsWith(`${path}/`)
    );
    
    if (needsVerifiedEmail && isAuthenticated && !token.emailVerified) {
      // Redirecționăm către o pagină de avertizare pentru verificarea email-ului
      return NextResponse.redirect(new URL('/auth/verify-request', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Returnăm true pentru a nu activa middleware-ul pentru rute publice
      authorized: () => true,
    },
  }
);

export const config = {
  // Configurăm matcher pentru a aplica middleware doar pe anumite rute
  matcher: [
    '/',
    '/profile/:path*',
    '/settings/:path*',
    '/conversations/:path*',
    '/admin/:path*',
    '/auth/:path*'
  ],
};