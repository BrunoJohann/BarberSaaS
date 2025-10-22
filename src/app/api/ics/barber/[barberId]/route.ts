import { AppointmentData, generateBarberFeedICS } from '@/lib/ics';
import { prisma } from '@/lib/prisma';
import { addDays } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { barberId: string } }
) {
  try {
    const { barberId } = params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '60');

    // Buscar barbeiro
    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
      include: {
        barbershop: true,
      },
    });

    if (!barber) {
      return NextResponse.json(
        { error: 'Barbeiro não encontrado' },
        { status: 404 }
      );
    }

    // Buscar agendamentos dos próximos N dias
    const fromDate = new Date();
    const toDate = addDays(fromDate, days);

    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        status: 'CONFIRMED',
        startsAt: { gte: fromDate },
        startsAt: { lte: toDate },
      },
      include: {
        barbershop: true,
        appointmentServices: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        startsAt: 'asc',
      },
    });

    // Preparar dados para geração do ICS
    const appointmentData: AppointmentData[] = appointments.map(
      (appointment) => ({
        id: appointment.id,
        barberName: barber.name,
        barbershopName: appointment.barbershop.name,
        barbershopAddress: appointment.barbershop.address,
        barbershopPhone: appointment.barbershop.phone,
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone,
        customerEmail: appointment.customerEmail || undefined,
        startsAt: appointment.startsAt,
        endsAt: appointment.endsAt,
        services: appointment.appointmentServices.map((aps) => ({
          name: aps.serviceName,
          durationMinutes: aps.durationMinutes,
          priceCents: aps.priceCents,
        })),
        totalPriceCents: appointment.appointmentServices.reduce(
          (total, aps) => total + aps.priceCents,
          0
        ),
      })
    );

    // Gerar ICS
    const ics = generateBarberFeedICS(barber.id, barber.name, appointmentData);

    // Retornar como arquivo .ics
    return new NextResponse(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="agenda-${barber.name
          .toLowerCase()
          .replace(/\s+/g, '-')}.ics"`,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar ICS do barbeiro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
