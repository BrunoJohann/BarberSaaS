import { prisma } from '@/lib/prisma';
import { getRecommendedBarber } from '@/lib/scheduling/recommendation';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      barbershopId,
      barberId,
      serviceIds,
      startsAt,
      customerName,
      customerPhone,
      customerEmail,
    } = body;

    // Validações básicas
    if (
      !barbershopId ||
      !serviceIds?.length ||
      !startsAt ||
      !customerName ||
      !customerPhone
    ) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Buscar serviços e calcular duração total
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds }, isActive: true },
    });

    if (services.length !== serviceIds.length) {
      return NextResponse.json(
        { error: 'Um ou mais serviços não encontrados' },
        { status: 400 }
      );
    }

    const totalDurationMinutes = services.reduce(
      (total, service) =>
        total + service.durationMinutes + service.bufferMinutes,
      0
    );

    const appointmentStart = new Date(startsAt);
    const appointmentEnd = new Date(
      appointmentStart.getTime() + totalDurationMinutes * 60 * 1000
    );

    // Transação anti-overbooking
    const result = await prisma.$transaction(async (tx) => {
      // Se barberId não fornecido, selecionar recomendado
      let selectedBarberId = barberId;
      if (!selectedBarberId) {
        selectedBarberId = await getRecommendedBarber(
          barbershopId,
          appointmentStart,
          serviceIds,
          tx
        );
      }

      // Verificar disponibilidade do barbeiro
      const isAvailable = await checkBarberAvailability(
        selectedBarberId,
        barbershopId,
        appointmentStart,
        appointmentEnd,
        tx
      );

      if (!isAvailable) {
        throw new Error('Slot indisponível');
      }

      // Criar agendamento
      const appointment = await tx.appointment.create({
        data: {
          barberId: selectedBarberId,
          barbershopId,
          customerName,
          customerPhone,
          customerEmail,
          startsAt: appointmentStart,
          endsAt: appointmentEnd,
          status: 'CONFIRMED',
        },
      });

      // Criar serviços do agendamento
      const appointmentServices = await Promise.all(
        services.map((service) =>
          tx.appointmentService.create({
            data: {
              appointmentId: appointment.id,
              serviceId: service.id,
              serviceName: service.name,
              durationMinutes: service.durationMinutes,
              bufferMinutes: service.bufferMinutes,
              priceCents: service.priceCents,
            },
          })
        )
      );

      // Registrar histórico de status
      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId: appointment.id,
          fromStatus: null,
          toStatus: 'CONFIRMED',
          reason: 'Agendamento criado',
        },
      });

      return { appointment, appointmentServices };
    });

    // Em background, publicar no calendário (best effort)
    publishAppointmentToCalendar(result.appointment.id).catch(console.error);

    return NextResponse.json({
      appointment: result.appointment,
      message: 'Agendamento criado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);

    if (error.message === 'Slot indisponível') {
      return NextResponse.json(
        { error: 'Slot indisponível. Tente outro horário.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function checkBarberAvailability(
  barberId: string,
  barbershopId: string,
  startsAt: Date,
  endsAt: Date,
  tx: any
): Promise<boolean> {
  // Verificar conflitos com outros agendamentos
  const conflictingAppointments = await tx.appointment.findMany({
    where: {
      barberId,
      barbershopId,
      status: { not: 'CANCELED' },
      OR: [
        {
          AND: [{ startsAt: { lt: endsAt } }, { endsAt: { gt: startsAt } }],
        },
      ],
    },
  });

  if (conflictingAppointments.length > 0) {
    return false;
  }

  // Verificar conflitos com bloqueios
  const conflictingBlocks = await tx.blockedTime.findMany({
    where: {
      barberId,
      barbershopId,
      isActive: true,
      OR: [
        {
          AND: [{ startsAt: { lt: endsAt } }, { endsAt: { gt: startsAt } }],
        },
      ],
    },
  });

  if (conflictingBlocks.length > 0) {
    return false;
  }

  return true;
}

async function publishAppointmentToCalendar(
  appointmentId: string
): Promise<void> {
  // Implementação mock - em produção, integrar com Google Calendar, Outlook, etc.
  console.log(`Publicando agendamento ${appointmentId} no calendário`);
}
