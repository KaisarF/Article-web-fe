
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {

  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;


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

    const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/user');
    if (isProtectedRoute) {

      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};