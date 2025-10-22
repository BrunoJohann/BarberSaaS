import { NextRequest } from 'next/server';
import { resolveTenant, TenantContext } from './resolveTenant';

declare global {
  var tenantContext: TenantContext | undefined;
}

export function injectTenantContext(tenantContext: TenantContext) {
  global.tenantContext = tenantContext;
}

export function getTenantContext(): TenantContext | undefined {
  return global.tenantContext;
}

export async function requireTenant(
  request: NextRequest
): Promise<TenantContext> {
  const tenantContext = await resolveTenant(request);

  if (!tenantContext) {
    throw new Error('Tenant não encontrado');
  }

  injectTenantContext(tenantContext);
  return tenantContext;
}

export function assertTenantContext(): TenantContext {
  const context = getTenantContext();
  if (!context) {
    throw new Error('Contexto de tenant não encontrado');
  }
  return context;
}
