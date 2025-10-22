import { endOfDay, startOfDay } from 'date-fns';

export async function getRecommendedBarber(
  barbershopId: string,
  appointmentDate: Date,
  serviceIds: string[],
  tx: any
): Promise<string> {
  // Buscar barbeiros ativos da barbearia que executam os serviços
  const barbers = await tx.barber.findMany({
    where: {
      barbershopId,
      isActive: true,
      // Em produção, verificar se o barbeiro executa os serviços
    },
    include: {
      services: {
        where: {
          serviceId: { in: serviceIds },
        },
      },
    },
  });

  if (barbers.length === 0) {
    throw new Error('Nenhum barbeiro disponível para os serviços selecionados');
  }

  // Filtrar apenas barbeiros que executam todos os serviços
  const eligibleBarbers = barbers.filter(
    (barber) => barber.services.length === serviceIds.length
  );

  if (eligibleBarbers.length === 0) {
    throw new Error('Nenhum barbeiro executa todos os serviços selecionados');
  }

  // Calcular métricas de cada barbeiro para o dia
  const dayStart = startOfDay(appointmentDate);
  const dayEnd = endOfDay(appointmentDate);

  const barberMetrics = await Promise.all(
    eligibleBarbers.map(async (barber) => {
      const appointments = await tx.appointment.findMany({
        where: {
          barberId: barber.id,
          barbershopId,
          status: 'CONFIRMED',
          startsAt: { gte: dayStart },
          endsAt: { lte: dayEnd },
        },
      });

      return {
        barberId: barber.id,
        barberName: barber.name,
        appointmentCount: appointments.length,
        createdAt: barber.createdAt,
      };
    })
  );

  // Ordenar por menor número de agendamentos, depois por menor createdAt
  barberMetrics.sort((a, b) => {
    if (a.appointmentCount !== b.appointmentCount) {
      return a.appointmentCount - b.appointmentCount;
    }
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return barberMetrics[0].barberId;
}

export async function getBarberWorkload(
  barberId: string,
  barbershopId: string,
  date: Date,
  tx: any
): Promise<{
  appointmentCount: number;
  totalWorkedMinutes: number;
  capacityMinutes: number;
  occupancyRate: number;
}> {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  // Buscar agendamentos confirmados do dia
  const appointments = await tx.appointment.findMany({
    where: {
      barberId,
      barbershopId,
      status: 'CONFIRMED',
      startsAt: { gte: dayStart },
      endsAt: { lte: dayEnd },
    },
  });

  const appointmentCount = appointments.length;
  const totalWorkedMinutes = appointments.reduce((total, apt) => {
    const duration = apt.endsAt.getTime() - apt.startsAt.getTime();
    return total + Math.floor(duration / (1000 * 60));
  }, 0);

  // Calcular capacidade do barbeiro (working periods menos bloqueios)
  const workingPeriods = await tx.workingPeriod.findMany({
    where: {
      barberId,
      barbershopId,
      dayOfWeek: date.getDay(),
      isActive: true,
    },
  });

  const blockedTimes = await tx.blockedTime.findMany({
    where: {
      barberId,
      barbershopId,
      isActive: true,
      startsAt: { lt: dayEnd },
      endsAt: { gt: dayStart },
    },
  });

  // Calcular capacidade total (simplificado)
  let capacityMinutes = 0;
  for (const period of workingPeriods) {
    const [startHour, startMin] = period.startTime.split(':').map(Number);
    const [endHour, endMin] = period.endTime.split(':').map(Number);
    const periodMinutes = endHour * 60 + endMin - (startHour * 60 + startMin);
    capacityMinutes += periodMinutes;
  }

  // Subtrair bloqueios
  for (const block of blockedTimes) {
    const blockMinutes =
      (block.endsAt.getTime() - block.startsAt.getTime()) / (1000 * 60);
    capacityMinutes -= blockMinutes;
  }

  const occupancyRate =
    capacityMinutes > 0 ? totalWorkedMinutes / capacityMinutes : 0;

  return {
    appointmentCount,
    totalWorkedMinutes,
    capacityMinutes: Math.max(0, capacityMinutes),
    occupancyRate: Math.min(1, Math.max(0, occupancyRate)),
  };
}
