import { prisma } from '@/lib/db/prisma';
import { NextRequest } from 'next/server';

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  barbershopId?: string;
  barbershopSlug?: string;
}

export async function resolveTenantFromSubdomain(
  request: NextRequest
): Promise<TenantContext | null> {
  const host = request.headers.get('host');
  if (!host) return null;

  // Remove port if present
  const hostname = host.split(':')[0];

  // Check if it's a subdomain (e.g., acme.localhost:3000)
  const parts = hostname.split('.');
  if (parts.length < 2) return null;

  const subdomain = parts[0];
  if (subdomain === 'www' || subdomain === 'localhost') return null;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: subdomain },
      select: { id: true, slug: true },
    });

    if (!tenant) return null;

    return {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
    };
  } catch (error) {
    console.error('Erro ao resolver tenant por subdomínio:', error);
    return null;
  }
}

export async function resolveTenantFromPath(
  request: NextRequest
): Promise<TenantContext | null> {
  const pathname = request.nextUrl.pathname;

  // Check for /t/[tenant] pattern
  const match = pathname.match(/^\/t\/([^/]+)(?:\/([^/]+))?/);
  if (!match) return null;

  const [, tenantSlug, barbershopSlug] = match;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true, slug: true },
    });

    if (!tenant) return null;

    const context: TenantContext = {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
    };

    // If barbershop slug is provided, resolve it
    if (barbershopSlug) {
      const barbershop = await prisma.barbershop.findFirst({
        where: {
          tenantId: tenant.id,
          slug: barbershopSlug,
        },
        select: { id: true, slug: true },
      });

      if (barbershop) {
        context.barbershopId = barbershop.id;
        context.barbershopSlug = barbershop.slug;
      }
    }

    return context;
  } catch (error) {
    console.error('Erro ao resolver tenant por path:', error);
    return null;
  }
}

export async function resolveTenant(
  request: NextRequest
): Promise<TenantContext | null> {
  // Try subdomain first
  const subdomainResult = await resolveTenantFromSubdomain(request);
  if (subdomainResult) return subdomainResult;

  // Fallback to path
  return resolveTenantFromPath(request);
}
