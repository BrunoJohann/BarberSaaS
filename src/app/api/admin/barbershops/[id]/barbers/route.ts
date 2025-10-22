import { authOptions } from '@/lib/auth/auth';
import { assertBarbershopScope, requireOwnerOrStaff } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    requireOwnerOrStaff(session.user as any);
    await assertBarbershopScope(session.user as any, params.id);

    const barbers = await prisma.barber.findMany({
      where: {
        barbershopId: params.id,
      },
      include: {
        workingPeriods: true,
        barberServices: {
          include: {
            service: true,
          },
        },
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    });

    return NextResponse.json({ barbers });
  } catch (error) {
    console.error('Erro ao buscar barbeiros:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    requireOwnerOrStaff(session.user as any);
    await assertBarbershopScope(session.user as any, params.id);

    const body = await request.json();
    const { name, bio, specialties, timezone, serviceIds } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    const barber = await prisma.barber.create({
      data: {
        tenantId: session.user.tenantId!,
        barbershopId: params.id,
        name,
        bio,
        specialties,
        timezone: timezone || 'America/Sao_Paulo',
      },
    });

    // Associate services if provided
    if (serviceIds && serviceIds.length > 0) {
      await prisma.barberService.createMany({
        data: serviceIds.map((serviceId: string) => ({
          tenantId: session.user.tenantId!,
          barberId: barber.id,
          serviceId,
        })),
      });
    }

    return NextResponse.json({ barber }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar barbeiro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
