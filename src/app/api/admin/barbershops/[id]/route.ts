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

    const barbershop = await prisma.barbershop.findUnique({
      where: { id: params.id },
      include: {
        settings: true,
        barbers: {
          include: {
            workingPeriods: true,
            barberServices: {
              include: {
                service: true,
              },
            },
          },
        },
        services: true,
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    });

    if (!barbershop) {
      return NextResponse.json(
        { error: 'Barbearia não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ barbershop });
  } catch (error) {
    console.error('Erro ao buscar barbearia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
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
    const { name, description, timezone, address, phone, slug } = body;

    const barbershop = await prisma.barbershop.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(timezone && { timezone }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(slug && { slug }),
      },
    });

    return NextResponse.json({ barbershop });
  } catch (error) {
    console.error('Erro ao atualizar barbearia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    requireOwnerOrStaff(session.user as any);
    await assertBarbershopScope(session.user as any, params.id);

    await prisma.barbershop.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar barbearia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
