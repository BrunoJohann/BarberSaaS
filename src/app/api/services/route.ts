import { prisma } from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant = searchParams.get('tenant');
    const barbershopId = searchParams.get('barbershopId');
    const barberId = searchParams.get('barberId');

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant é obrigatório' },
        { status: 400 }
      );
    }

    const where: any = {
      tenant: { slug: tenant },
      isActive: true,
    };

    if (barbershopId) {
      where.barbershopId = barbershopId;
    }

    if (barberId) {
      where.barberServices = {
        some: {
          barberId: barberId,
        },
      };
    }

    const services = await prisma.service.findMany({
      where,
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
