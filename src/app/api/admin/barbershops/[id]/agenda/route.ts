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

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const barberId = searchParams.get('barberId');

    const where: any = {
      barbershopId: params.id,
    };

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      where.startsAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    if (barberId) {
      where.barberId = barberId;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        barber: {
          select: {
            id: true,
            name: true,
          },
        },
        appointmentServices: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                durationMinutes: true,
              },
            },
          },
        },
      },
      orderBy: {
        startsAt: 'asc',
      },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Erro ao buscar agenda:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
