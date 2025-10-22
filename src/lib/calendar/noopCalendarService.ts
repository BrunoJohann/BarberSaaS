import { CalendarService } from './types';

export class NoopCalendarService implements CalendarService {
  async publishAppointment(appointmentId: string): Promise<void> {
    console.log(`[NoopCalendar] Publicando agendamento: ${appointmentId}`);
    // No-op implementation
  }

  async updateAppointment(appointmentId: string): Promise<void> {
    console.log(`[NoopCalendar] Atualizando agendamento: ${appointmentId}`);
    // No-op implementation
  }

  async deleteAppointment(appointmentId: string): Promise<void> {
    console.log(`[NoopCalendar] Deletando agendamento: ${appointmentId}`);
    // No-op implementation
  }

  async getBarberIcsFeed(barberId: string): Promise<string> {
    console.log(`[NoopCalendar] Gerando feed ICS para barbeiro: ${barberId}`);
    // Return empty ICS feed
    return generateEmptyIcsFeed(barberId);
  }

  async getSingleEventIcs(appointmentId: string): Promise<string> {
    console.log(`[NoopCalendar] Gerando evento ICS: ${appointmentId}`);
    // Return empty ICS event
    return generateEmptyIcsEvent(appointmentId);
  }
}

function generateEmptyIcsFeed(barberId: string): string {
  const now = new Date();
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BarberSaaS//Barber Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Barbeiro ${barberId}`,
    `DTSTART:${formatIcsDate(now)}`,
    'END:VCALENDAR',
  ].join('\r\n');
}

function generateEmptyIcsEvent(appointmentId: string): string {
  const now = new Date();
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BarberSaaS//Appointment//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${appointmentId}@barbersaas.com`,
    `DTSTART:${formatIcsDate(now)}`,
    `DTEND:${formatIcsDate(new Date(now.getTime() + 30 * 60 * 1000))}`,
    `SUMMARY:Agendamento ${appointmentId}`,
    'DESCRIPTION:Agendamento na barbearia',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export const calendarService = new NoopCalendarService();
