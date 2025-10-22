import { addMinutes, isAfter, isBefore } from 'date-fns';
import { getSlotGranularityMinutes } from './granularity';
import { BarberOption, FreeWindow, Slot } from './types';

export function generateFreeWindows(
  workingPeriods: any[],
  blockedTimes: any[],
  appointments: any[],
  date: Date,
  barbershopId: string,
  barberId?: string
): FreeWindow[] {
  const dayOfWeek = date.getDay();
  const periods = workingPeriods.filter(
    (wp) =>
      wp.dayOfWeek === dayOfWeek &&
      wp.isActive &&
      (!barberId || wp.barberId === barberId)
  );

  if (periods.length === 0) return [];

  const windows: FreeWindow[] = [];

  for (const period of periods) {
    const { start: periodStart, end: periodEnd } = convertWorkingPeriodToUTC(
      period,
      date,
      barbershopId
    );

    // Filtrar bloqueios e agendamentos para este período
    const periodBlockedTimes = blockedTimes.filter(
      (bt) =>
        bt.barbershopId === barbershopId &&
        (!barberId || bt.barberId === barberId) &&
        bt.isActive &&
        isAfter(bt.endsAt, periodStart) &&
        isBefore(bt.startsAt, periodEnd)
    );

    const periodAppointments = appointments.filter(
      (apt) =>
        apt.barbershopId === barbershopId &&
        (!barberId || apt.barberId === barberId) &&
        apt.status !== 'CANCELED' &&
        isAfter(apt.endsAt, periodStart) &&
        isBefore(apt.startsAt, periodEnd)
    );

    // Combinar todos os bloqueios
    const allBlocks = [
      ...periodBlockedTimes.map((bt) => ({
        start: bt.startsAt,
        end: bt.endsAt,
      })),
      ...periodAppointments.map((apt) => ({
        start: apt.startsAt,
        end: apt.endsAt,
      })),
    ].sort((a, b) => a.start.getTime() - b.start.getTime());

    // Gerar janelas livres
    let currentStart = periodStart;

    for (const block of allBlocks) {
      if (isAfter(block.start, currentStart)) {
        windows.push({
          start: currentStart,
          end: block.start,
        });
      }
      currentStart = isAfter(block.end, currentStart)
        ? block.end
        : currentStart;
    }

    // Adicionar janela final se houver
    if (isBefore(currentStart, periodEnd)) {
      windows.push({
        start: currentStart,
        end: periodEnd,
      });
    }
  }

  return windows;
}

export function generateStartsOnGrid(
  freeWindows: FreeWindow[],
  totalDurationMinutes: number,
  granularityMinutes: number
): Date[] {
  const starts: Date[] = [];

  for (const window of freeWindows) {
    const windowDuration = window.end.getTime() - window.start.getTime();
    const totalDurationMs = totalDurationMinutes * 60 * 1000;

    if (windowDuration < totalDurationMs) continue;

    // Arredondar start para cima ao grid
    const startTime = window.start.getTime();
    const gridMs = granularityMinutes * 60 * 1000;
    const roundedStartTime = Math.ceil(startTime / gridMs) * gridMs;
    const roundedStart = new Date(roundedStartTime);

    // Calcular último start possível
    const lastPossibleStart = new Date(window.end.getTime() - totalDurationMs);
    const lastStartTime =
      Math.floor(lastPossibleStart.getTime() / gridMs) * gridMs;
    const lastStart = new Date(lastStartTime);

    // Gerar starts no grid
    let currentStart = roundedStart;
    while (currentStart <= lastStart) {
      const currentEnd = addMinutes(currentStart, totalDurationMinutes);

      // Verificar se cabe no intervalo (exclusivo)
      if (
        isBefore(currentStart, window.end) &&
        isBefore(currentEnd, window.end)
      ) {
        starts.push(new Date(currentStart));
      }

      currentStart = addMinutes(currentStart, granularityMinutes);
    }
  }

  // Remover duplicatas e ordenar
  return [...new Set(starts.map((s) => s.getTime()))]
    .map((time) => new Date(time))
    .sort((a, b) => a.getTime() - b.getTime());
}

export function generateSlots(
  freeWindows: FreeWindow[],
  totalDurationMinutes: number,
  barbershopId: string,
  barberId?: string
): Slot[] {
  const granularity = getSlotGranularityMinutes(barbershopId);
  const starts = generateStartsOnGrid(
    freeWindows,
    totalDurationMinutes,
    granularity
  );

  return starts.map((start) => {
    const end = addMinutes(start, totalDurationMinutes);

    // Se barberId específico, retornar apenas ele
    if (barberId) {
      return {
        start,
        end,
        barberOptions: [{ barberId, barberName: 'Barbeiro' }], // Em produção, buscar nome
        recommendedBarberId: barberId,
      };
    }

    // Para "sem preferência", calcular opções de barbeiros
    const barberOptions = getAvailableBarbersForSlot(start, end, barbershopId);
    const recommendedBarberId = getRecommendedBarber(
      barberOptions,
      start,
      barbershopId
    );

    return {
      start,
      end,
      barberOptions,
      recommendedBarberId,
    };
  });
}

function getAvailableBarbersForSlot(
  start: Date,
  end: Date,
  barbershopId: string
): BarberOption[] {
  // Em produção, buscar barbeiros ativos da barbearia
  // que executam os serviços necessários
  return [
    { barberId: '1', barberName: 'João Silva' },
    { barberId: '2', barberName: 'Maria Santos' },
  ];
}

function getRecommendedBarber(
  barberOptions: BarberOption[],
  start: Date,
  barbershopId: string
): string {
  // Em produção, implementar lógica de recomendação justa:
  // - Barbeiro com menos appointments CONFIRMED no dia
  // - Em caso de empate, menor createdAt
  return barberOptions[0]?.barberId || '';
}

// Função auxiliar para converter working period para UTC
function convertWorkingPeriodToUTC(
  period: any,
  date: Date,
  barbershopId: string
): { start: Date; end: Date } {
  // Implementação simplificada - em produção usar date-fns-tz
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const [startHour, startMin] = period.startTime.split(':').map(Number);
  const [endHour, endMin] = period.endTime.split(':').map(Number);

  const start = new Date(dayStart);
  start.setHours(startHour, startMin, 0, 0);

  const end = new Date(dayStart);
  end.setHours(endHour, endMin, 0, 0);

  return { start, end };
}
