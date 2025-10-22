import { AppointmentData, generateAppointmentICS } from '@/lib/ics';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Buscar agendamento com dados completos
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        barber: true,
        barbershop: true,
        appointmentServices: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }

    // Preparar dados para geração do ICS
    const appointmentData: AppointmentData = {
      id: appointment.id,
      barberName: appointment.barber?.name || 'Barbeiro não definido',
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
    };

    // Gerar ICS
    const ics = generateAppointmentICS(appointmentData);

    // Retornar como arquivo .ics
    return new NextResponse(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="agendamento-${id}.ics"`,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar ICS do agendamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
