import { prisma } from '@/lib/prisma';
import { generateFreeWindows } from '@/lib/scheduling/slots';
import { addDays, endOfDay, format, startOfDay } from 'date-fns';

export interface MetricsSummary {
  appointments: number;
  cancellations: number;
  cancelRate: number;
  avgDurationMin: number;
  occupancyPct: number;
}

export interface TimeSeriesData {
  date: string;
  appointments: number;
  cancellations: number;
}

export interface BarberPerformance {
  barberId: string;
  barberName: string;
  appointments: number;
  workedMin: number;
  capacityMin: number;
  occupancyPct: number;
  cancelRate: number;
  nextAvailableInMin: number;
}

export interface ServiceMix {
  serviceId: string;
  name: string;
  count: number;
}

export interface HeatmapData {
  weekday: number;
  hour: number;
  appointments: number;
}

export interface MetricsResponse {
  summary: MetricsSummary;
  timeseries: {
    byDay: TimeSeriesData[];
  };
  barberPerformance: BarberPerformance[];
  serviceMix: ServiceMix[];
  heatmap: {
    weekdayHour: HeatmapData[];
  };
}

export async function getBarbershopMetrics(
  barbershopId: string,
  fromDate: Date,
  toDate: Date
): Promise<MetricsResponse> {
  const from = startOfDay(fromDate);
  const to = endOfDay(toDate);

  // Buscar dados básicos
  const [appointments, cancellations, barbers, services] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        barbershopId,
        startsAt: { gte: from },
        startsAt: { lte: to },
        status: 'CONFIRMED',
      },
      include: {
        appointmentServices: true,
        barber: true,
      },
    }),
    prisma.appointment.findMany({
      where: {
        barbershopId,
        startsAt: { gte: from },
        startsAt: { lte: to },
        status: 'CANCELED',
      },
      include: {
        appointmentServices: true,
        barber: true,
      },
    }),
    prisma.barber.findMany({
      where: { barbershopId, isActive: true },
    }),
    prisma.service.findMany({
      where: { barbershopId, isActive: true },
    }),
  ]);

  // Calcular resumo
  const totalAppointments = appointments.length;
  const totalCancellations = cancellations.length;
  const cancelRate =
    totalAppointments + totalCancellations > 0
      ? totalCancellations / (totalAppointments + totalCancellations)
      : 0;

  const totalWorkedMinutes = appointments.reduce((total, apt) => {
    const duration = apt.endsAt.getTime() - apt.startsAt.getTime();
    return total + Math.floor(duration / (1000 * 60));
  }, 0);

  const avgDurationMin =
    totalAppointments > 0 ? totalWorkedMinutes / totalAppointments : 0;

  // Calcular ocupação (simplificado)
  const totalCapacityMinutes = await calculateTotalCapacity(
    barbershopId,
    from,
    to,
    barbers
  );
  const occupancyPct =
    totalCapacityMinutes > 0
      ? Math.min(1, totalWorkedMinutes / totalCapacityMinutes)
      : 0;

  // Calcular timeseries
  const timeseries = await calculateTimeSeries(barbershopId, from, to);

  // Calcular performance dos barbeiros
  const barberPerformance = await Promise.all(
    barbers.map((barber) => calculateBarberPerformance(barber, from, to))
  );

  // Calcular mix de serviços
  const serviceMix = calculateServiceMix(appointments, services);

  // Calcular heatmap
  const heatmap = calculateHeatmap(appointments);

  return {
    summary: {
      appointments: totalAppointments,
      cancellations: totalCancellations,
      cancelRate,
      avgDurationMin: Math.round(avgDurationMin),
      occupancyPct: Math.round(occupancyPct * 100) / 100,
    },
    timeseries: {
      byDay: timeseries,
    },
    barberPerformance,
    serviceMix,
    heatmap: {
      weekdayHour: heatmap,
    },
  };
}

async function calculateTotalCapacity(
  barbershopId: string,
  from: Date,
  to: Date,
  barbers: any[]
): Promise<number> {
  let totalCapacity = 0;

  for (const barber of barbers) {
    const workingPeriods = await prisma.workingPeriod.findMany({
      where: {
        barberId: barber.id,
        barbershopId,
        isActive: true,
      },
    });

    const blockedTimes = await prisma.blockedTime.findMany({
      where: {
        barberId: barber.id,
        barbershopId,
        isActive: true,
        startsAt: { lt: to },
        endsAt: { gt: from },
      },
    });

    // Calcular capacidade por dia
    for (let date = new Date(from); date <= to; date = addDays(date, 1)) {
      const dayOfWeek = date.getDay();
      const dayPeriods = workingPeriods.filter(
        (wp) => wp.dayOfWeek === dayOfWeek
      );

      for (const period of dayPeriods) {
        const [startHour, startMin] = period.startTime.split(':').map(Number);
        const [endHour, endMin] = period.endTime.split(':').map(Number);
        const periodMinutes =
          endHour * 60 + endMin - (startHour * 60 + startMin);
        totalCapacity += periodMinutes;
      }
    }

    // Subtrair bloqueios
    for (const block of blockedTimes) {
      const blockMinutes =
        (block.endsAt.getTime() - block.startsAt.getTime()) / (1000 * 60);
      totalCapacity -= blockMinutes;
    }
  }

  return Math.max(0, totalCapacity);
}

async function calculateTimeSeries(
  barbershopId: string,
  from: Date,
  to: Date
): Promise<TimeSeriesData[]> {
  const timeseries: TimeSeriesData[] = [];

  for (let date = new Date(from); date <= to; date = addDays(date, 1)) {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const [appointments, cancellations] = await Promise.all([
      prisma.appointment.count({
        where: {
          barbershopId,
          startsAt: { gte: dayStart },
          startsAt: { lte: dayEnd },
          status: 'CONFIRMED',
        },
      }),
      prisma.appointment.count({
        where: {
          barbershopId,
          startsAt: { gte: dayStart },
          startsAt: { lte: dayEnd },
          status: 'CANCELED',
        },
      }),
    ]);

    timeseries.push({
      date: format(date, 'yyyy-MM-dd'),
      appointments,
      cancellations,
    });
  }

  return timeseries;
}

async function calculateBarberPerformance(
  barber: any,
  from: Date,
  to: Date
): Promise<BarberPerformance> {
  const [appointments, cancellations] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        barberId: barber.id,
        startsAt: { gte: from },
        startsAt: { lte: to },
        status: 'CONFIRMED',
      },
    }),
    prisma.appointment.findMany({
      where: {
        barberId: barber.id,
        startsAt: { gte: from },
        startsAt: { lte: to },
        status: 'CANCELED',
      },
    }),
  ]);

  const workedMin = appointments.reduce((total, apt) => {
    const duration = apt.endsAt.getTime() - apt.startsAt.getTime();
    return total + Math.floor(duration / (1000 * 60));
  }, 0);

  const capacityMin = await calculateBarberCapacity(barber.id, from, to);
  const occupancyPct =
    capacityMin > 0 ? Math.min(1, workedMin / capacityMin) : 0;

  const totalAppointments = appointments.length;
  const totalCancellations = cancellations.length;
  const cancelRate =
    totalAppointments + totalCancellations > 0
      ? totalCancellations / (totalAppointments + totalCancellations)
      : 0;

  // Calcular próximo horário disponível
  const nextAvailableInMin = await calculateNextAvailable(
    barber.id,
    barber.barbershopId
  );

  return {
    barberId: barber.id,
    barberName: barber.name,
    appointments: totalAppointments,
    workedMin,
    capacityMin,
    occupancyPct: Math.round(occupancyPct * 100) / 100,
    cancelRate: Math.round(cancelRate * 100) / 100,
    nextAvailableInMin,
  };
}

async function calculateBarberCapacity(
  barberId: string,
  from: Date,
  to: Date
): Promise<number> {
  const workingPeriods = await prisma.workingPeriod.findMany({
    where: {
      barberId,
      isActive: true,
    },
  });

  let capacity = 0;

  for (let date = new Date(from); date <= to; date = addDays(date, 1)) {
    const dayOfWeek = date.getDay();
    const dayPeriods = workingPeriods.filter(
      (wp) => wp.dayOfWeek === dayOfWeek
    );

    for (const period of dayPeriods) {
      const [startHour, startMin] = period.startTime.split(':').map(Number);
      const [endHour, endMin] = period.endTime.split(':').map(Number);
      const periodMinutes = endHour * 60 + endMin - (startHour * 60 + startMin);
      capacity += periodMinutes;
    }
  }

  return capacity;
}

async function calculateNextAvailable(
  barberId: string,
  barbershopId: string
): Promise<number> {
  const now = new Date();
  const tomorrow = addDays(now, 1);

  // Buscar próximo slot disponível (simplificado)
  const freeWindows = generateFreeWindows(
    [], // working periods - em produção, buscar do banco
    [], // blocked times
    [], // appointments
    tomorrow,
    barbershopId,
    barberId
  );

  if (freeWindows.length === 0) {
    return -1; // Indisponível
  }

  const nextSlot = freeWindows[0].start;
  const diffMinutes = Math.floor(
    (nextSlot.getTime() - now.getTime()) / (1000 * 60)
  );

  return Math.max(0, diffMinutes);
}

function calculateServiceMix(
  appointments: any[],
  services: any[]
): ServiceMix[] {
  const serviceCounts = new Map<string, number>();

  for (const appointment of appointments) {
    for (const service of appointment.appointmentServices) {
      const count = serviceCounts.get(service.serviceId) || 0;
      serviceCounts.set(service.serviceId, count + 1);
    }
  }

  return services
    .map((service) => ({
      serviceId: service.id,
      name: service.name,
      count: serviceCounts.get(service.id) || 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateHeatmap(appointments: any[]): HeatmapData[] {
  const heatmap = new Map<string, number>();

  for (const appointment of appointments) {
    const weekday = appointment.startsAt.getDay();
    const hour = appointment.startsAt.getHours();
    const key = `${weekday}-${hour}`;

    const count = heatmap.get(key) || 0;
    heatmap.set(key, count + 1);
  }

  const result: HeatmapData[] = [];
  for (const [key, count] of heatmap) {
    const [weekday, hour] = key.split('-').map(Number);
    result.push({ weekday, hour, appointments: count });
  }

  return result.sort((a, b) => a.weekday - b.weekday || a.hour - b.hour);
}
