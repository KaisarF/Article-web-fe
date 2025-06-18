// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Ambil token dan role dari cookies
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  // 2. Daftar rute publik yang bisa diakses tanpa login
  const publicPaths = ['/login', '/register'];


  if (token) {

    if (publicPaths.includes(pathname)) {
      if (role === 'Admin') {
        return NextResponse.redirect(new URL('/admin/articles', request.url));
      }
      if (role === 'User') {
        return NextResponse.redirect(new URL('/user/articles', request.url));
      }
    }

    if (role === 'Admin') {

      if (pathname.startsWith('/user')) {
        return NextResponse.redirect(new URL('/admin/articles', request.url));
      }
    }

    if (role === 'User') {

      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/user/articles', request.url));
      }
    }


    if (pathname === '/') {
       if (role === 'Admin') {
        return NextResponse.redirect(new URL('/admin/articles', request.url));
      }
      if (role === 'User') {
        return NextResponse.redirect(new URL('/user/articles', request.url));
      }
    }

  } else {
    // 4. Jika user belum login (tidak punya token)
    // dan mencoba mengakses rute yang dilindungi (bukan login/register)
    const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/user');
    if (isProtectedRoute) {
      // Redirect ke halaman login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Jika user belum login dan mengakses root ('/'), redirect ke login
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Jika tidak ada kondisi di atas yang terpenuhi, biarkan user melanjutkan
  return NextResponse.next();
}

// 5. Konfigurasi Matcher: Tentukan rute mana yang akan menjalankan middleware
export const config = {
  matcher: [
    /*
     * Cocokkan semua path KECUALI yang berikut:
     * - api (rute API)
     * - _next/static (file statis)
     * - _next/image (optimisasi gambar)
     * - favicon.ico (file favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};