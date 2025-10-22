import { authOptions } from '@/lib/auth/auth';
import { requireOwnerOrStaff } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    requireOwnerOrStaff(session.user as any);

    const barbershops = await prisma.barbershop.findMany({
      where: {
        tenantId: session.user.tenantId,
      },
      include: {
        settings: true,
        _count: {
          select: {
            barbers: true,
            services: true,
            appointments: true,
          },
        },
      },
    });

    return NextResponse.json({ barbershops });
  } catch (error) {
    console.error('Erro ao buscar barbearias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    requireOwnerOrStaff(session.user as any);

    const body = await request.json();
    const { name, description, timezone, address, phone, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Nome e slug são obrigatórios' },
        { status: 400 }
      );
    }

    const barbershop = await prisma.barbershop.create({
      data: {
        tenantId: session.user.tenantId!,
        name,
        description,
        timezone: timezone || 'America/Sao_Paulo',
        address,
        phone,
        slug,
      },
    });

    return NextResponse.json({ barbershop }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar barbearia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
