import { format, parseISO, startOfDay } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

export function getBarbershopTimezone(barbershopId: string): string {
  // Em produção, buscar do banco de dados
  // Por enquanto, retorna timezone padrão
  return 'America/Sao_Paulo';
}

export function toBarbershopTimezone(date: Date, barbershopId: string): Date {
  const timezone = getBarbershopTimezone(barbershopId);
  return utcToZonedTime(date, timezone);
}

export function toUTC(date: Date, barbershopId: string): Date {
  const timezone = getBarbershopTimezone(barbershopId);
  return zonedTimeToUtc(date, timezone);
}

export function formatTimeInBarbershopTimezone(
  date: Date,
  barbershopId: string
): string {
  const timezone = getBarbershopTimezone(barbershopId);
  return format(date, 'HH:mm', { timeZone: timezone });
}

export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

export function getWorkingPeriodForDay(
  workingPeriods: any[],
  dayOfWeek: number,
  barberId?: string
): any[] {
  return workingPeriods.filter(
    (wp) =>
      wp.dayOfWeek === dayOfWeek &&
      wp.isActive &&
      (!barberId || wp.barberId === barberId)
  );
}

export function convertWorkingPeriodToUTC(
  workingPeriod: any,
  date: Date,
  barbershopId: string
): { start: Date; end: Date } {
  const timezone = getBarbershopTimezone(barbershopId);

  // Criar data no timezone da barbearia
  const dayStart = startOfDay(date);
  const startTime = parseISO(
    `${format(dayStart, 'yyyy-MM-dd')}T${workingPeriod.startTime}:00`
  );
  const endTime = parseISO(
    `${format(dayStart, 'yyyy-MM-dd')}T${workingPeriod.endTime}:00`
  );

  // Converter para UTC
  const startUTC = zonedTimeToUtc(startTime, timezone);
  const endUTC = zonedTimeToUtc(endTime, timezone);

  return { start: startUTC, end: endUTC };
}

export function isWithinWorkingHours(
  date: Date,
  workingPeriods: any[],
  barbershopId: string,
  barberId?: string
): boolean {
  const dayOfWeek = getDayOfWeek(date);
  const periods = getWorkingPeriodForDay(workingPeriods, dayOfWeek, barberId);

  if (periods.length === 0) return false;

  const timezone = getBarbershopTimezone(barbershopId);
  const localTime = utcToZonedTime(date, timezone);
  const timeStr = format(localTime, 'HH:mm');

  return periods.some(
    (period) => timeStr >= period.startTime && timeStr < period.endTime
  );
}
