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

  // Jika user sudah login (punya token)
  if (token) {
    // Jika user sudah login dan mencoba mengakses halaman login/register,
    // redirect mereka ke dashboard sesuai role
    if (publicPaths.includes(pathname)) {
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (role === 'user') {
        return NextResponse.redirect(new URL('/user/profile', request.url));
      }
    }

    // 3. Logika proteksi rute berdasarkan role
    // Jika role adalah 'admin'
    if (role === 'admin') {
      // Jika admin mencoba mengakses rute user, redirect ke dashboard admin
      if (pathname.startsWith('/user')) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
    
    // Jika role adalah 'user'
    if (role === 'user') {
      // Jika user mencoba mengakses rute admin, redirect ke dashboard user
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/user/profile', request.url));
      }
    }

    // Jika user mengakses root ('/'), redirect sesuai role
    if (pathname === '/') {
       if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (role === 'user') {
        return NextResponse.redirect(new URL('/user/profile', request.url));
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