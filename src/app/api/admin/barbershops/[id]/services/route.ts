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

    const services = await prisma.service.findMany({
      where: {
        barbershopId: params.id,
      },
      include: {
        barberServices: {
          include: {
            barber: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            appointmentServices: true,
          },
        },
      },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
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
    const { name, durationMinutes, bufferMinutes, priceCents } = body;

    if (!name || !durationMinutes || priceCents === undefined) {
      return NextResponse.json(
        { error: 'Nome, duração e preço são obrigatórios' },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        tenantId: session.user.tenantId!,
        barbershopId: params.id,
        name,
        durationMinutes: parseInt(durationMinutes),
        bufferMinutes: parseInt(bufferMinutes) || 0,
        priceCents: parseInt(priceCents),
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
