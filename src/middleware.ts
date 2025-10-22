import { resolveTenant } from '@/lib/tenancy/resolveTenant';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes that don't need tenant resolution
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // For barber routes, try to resolve tenant
  if (pathname.startsWith('/t/') || pathname === '/') {
    try {
      const tenantContext = await resolveTenant(request);

      if (tenantContext) {
        // Add tenant context to headers for API routes
        const response = NextResponse.next();
        response.headers.set('x-tenant-id', tenantContext.tenantId);
        response.headers.set('x-tenant-slug', tenantContext.tenantSlug);

        if (tenantContext.barbershopId) {
          response.headers.set('x-barbershop-id', tenantContext.barbershopId);
        }
        if (tenantContext.barbershopSlug) {
          response.headers.set(
            'x-barbershop-slug',
            tenantContext.barbershopSlug
          );
        }

        return response;
      }
    } catch (error) {
      console.error('Erro no middleware de tenant:', error);
    }
  }

  // For dashboard routes, check authentication (will be implemented in Prompt 2)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/login')) {
    // TODO: Implement authentication check
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
