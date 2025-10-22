import { prisma } from '@/lib/db/prisma';
import { UserRole } from '@prisma/client';

export interface User {
  id: string;
  role: UserRole;
  tenantId: string;
  staffBarbershops?: Array<{
    barbershopId: string;
  }>;
}

export function requireRole(user: User, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Acesso negado: permissão insuficiente');
  }
}

export function requireOwnerOrStaff(user: User): void {
  requireRole(user, [UserRole.OWNER, UserRole.STAFF]);
}

export function requireOwner(user: User): void {
  requireRole(user, [UserRole.OWNER]);
}

export async function assertBarbershopScope(
  user: User,
  barbershopId: string
): Promise<void> {
  // OWNER can access any barbershop in their tenant
  if (user.role === UserRole.OWNER) {
    const barbershop = await prisma.barbershop.findFirst({
      where: {
        id: barbershopId,
        tenantId: user.tenantId,
      },
    });

    if (!barbershop) {
      throw new Error('Barbearia não encontrada ou não pertence ao tenant');
    }
    return;
  }

  // STAFF can only access barbershops they're assigned to
  if (user.role === UserRole.STAFF) {
    const hasAccess = user.staffBarbershops?.some(
      (sb) => sb.barbershopId === barbershopId
    );

    if (!hasAccess) {
      throw new Error(
        'Acesso negado: barbeiro não tem acesso a esta barbearia'
      );
    }
    return;
  }

  throw new Error('Acesso negado: role não permitido');
}

export function canAccessBarbershop(user: User, barbershopId: string): boolean {
  if (user.role === UserRole.OWNER) {
    return true; // Will be validated at database level
  }

  if (user.role === UserRole.STAFF) {
    return (
      user.staffBarbershops?.some((sb) => sb.barbershopId === barbershopId) ??
      false
    );
  }

  return false;
}
