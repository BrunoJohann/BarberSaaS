import { CalendarEvent } from './types';

export function generateIcsFeed(
  events: CalendarEvent[],
  calendarName: string
): string {
  const now = new Date();

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BarberSaaS//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    `DTSTART:${formatIcsDate(now)}`,
    'X-WR-TIMEZONE:America/Sao_Paulo',
  ];

  events.forEach((event) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@barbersaas.com`,
      `DTSTART:${formatIcsDate(event.start)}`,
      `DTEND:${formatIcsDate(event.end)}`,
      `SUMMARY:${event.title}`,
      event.description ? `DESCRIPTION:${event.description}` : '',
      event.location ? `LOCATION:${event.location}` : '',
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');

  return lines.filter((line) => line !== '').join('\r\n');
}

export function generateIcsEvent(event: CalendarEvent): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BarberSaaS//Event//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@barbersaas.com`,
    `DTSTART:${formatIcsDate(event.start)}`,
    `DTEND:${formatIcsDate(event.end)}`,
    `SUMMARY:${event.title}`,
    event.description ? `DESCRIPTION:${event.description}` : '',
    event.location ? `LOCATION:${event.location}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.filter((line) => line !== '').join('\r\n');
}

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}
