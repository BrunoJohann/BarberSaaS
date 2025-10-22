import { authOptions } from '@/lib/auth/auth';
import { assertBarbershopScope, requireOwnerOrStaff } from '@/lib/auth/rbac';
import { clearSlotGranularityCache } from '@/lib/config/slotGranularity';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    requireOwnerOrStaff(session.user as any);
    await assertBarbershopScope(session.user as any, params.id);

    const body = await request.json();
    const { slotGranularity, timezone } = body;

    // Validate slot granularity
    if (
      slotGranularity &&
      (slotGranularity < 5 ||
        slotGranularity > 60 ||
        60 % slotGranularity !== 0)
    ) {
      return NextResponse.json(
        {
          error:
            'Granularidade deve estar entre 5 e 60 minutos e ser divisor de 60',
        },
        { status: 400 }
      );
    }

    // Update or create settings
    const settings = await prisma.barbershopSettings.upsert({
      where: { barbershopId: params.id },
      update: {
        ...(slotGranularity !== undefined && { slotGranularity }),
      },
      create: {
        tenantId: session.user.tenantId!,
        barbershopId: params.id,
        ...(slotGranularity !== undefined && { slotGranularity }),
      },
    });

    // Update timezone on barbershop if provided
    if (timezone) {
      await prisma.barbershop.update({
        where: { id: params.id },
        data: { timezone },
      });
    }

    // Clear cache
    clearSlotGranularityCache(params.id);

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
