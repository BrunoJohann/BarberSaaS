import { format } from 'date-fns';

export interface AppointmentData {
  id: string;
  barberName: string;
  barbershopName: string;
  barbershopAddress: string;
  barbershopPhone: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  startsAt: Date;
  endsAt: Date;
  services: Array<{
    name: string;
    durationMinutes: number;
    priceCents: number;
  }>;
  totalPriceCents: number;
}

export function generateAppointmentICS(appointment: AppointmentData): string {
  const startUTC = format(appointment.startsAt, "yyyyMMdd'T'HHmmss'Z'");
  const endUTC = format(appointment.endsAt, "yyyyMMdd'T'HHmmss'Z'");
  const nowUTC = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");

  const servicesList = appointment.services
    .map(
      (service) =>
        `• ${service.name} (${service.durationMinutes}min) - R$ ${(
          service.priceCents / 100
        ).toFixed(2)}`
    )
    .join('\\n');

  const totalPrice = (appointment.totalPriceCents / 100).toFixed(2);

  const description = [
    `Agendamento na ${appointment.barbershopName}`,
    `Barbeiro: ${appointment.barberName}`,
    `Cliente: ${appointment.customerName}`,
    `Telefone: ${appointment.customerPhone}`,
    '',
    'Serviços:',
    servicesList,
    '',
    `Total: R$ ${totalPrice}`,
    '',
    `Endereço: ${appointment.barbershopAddress}`,
    `Telefone: ${appointment.barbershopPhone}`,
  ].join('\\n');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BarberSaaS//Agendamento//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    '',
    'BEGIN:VEVENT',
    `UID:appointment-${appointment.id}@barbersaas.com`,
    `DTSTAMP:${nowUTC}`,
    `DTSTART:${startUTC}`,
    `DTEND:${endUTC}`,
    `SUMMARY:Agendamento - ${appointment.barbershopName}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${appointment.barbershopAddress}`,
    `ORGANIZER:CN=${appointment.barbershopName}:MAILTO:contato@barbersaas.com`,
    `ATTENDEE:CN=${appointment.customerName}:MAILTO:${
      appointment.customerEmail || 'cliente@example.com'
    }`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'SEQUENCE:0',
    'END:VEVENT',
    '',
    'END:VCALENDAR',
  ].join('\r\n');

  return ics;
}

export function generateBarberFeedICS(
  barberId: string,
  barberName: string,
  appointments: AppointmentData[]
): string {
  const nowUTC = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");

  const events = appointments
    .map((appointment) => {
      const startUTC = format(appointment.startsAt, "yyyyMMdd'T'HHmmss'Z'");
      const endUTC = format(appointment.endsAt, "yyyyMMdd'T'HHmmss'Z'");

      const servicesList = appointment.services
        .map((service) => `• ${service.name} (${service.durationMinutes}min)`)
        .join('\\n');

      const description = [
        `Cliente: ${appointment.customerName}`,
        `Telefone: ${appointment.customerPhone}`,
        '',
        'Serviços:',
        servicesList,
      ].join('\\n');

      return [
        'BEGIN:VEVENT',
        `UID:appointment-${appointment.id}@barbersaas.com`,
        `DTSTAMP:${nowUTC}`,
        `DTSTART:${startUTC}`,
        `DTEND:${endUTC}`,
        `SUMMARY:${appointment.customerName} - ${appointment.barbershopName}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${appointment.barbershopAddress}`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'SEQUENCE:0',
        'END:VEVENT',
      ].join('\r\n');
    })
    .join('\r\n\r\n');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BarberSaaS//Barbeiro//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Agenda - ${barberName}`,
    `X-WR-CALDESC:Agenda de agendamentos do barbeiro ${barberName}`,
    '',
    events,
    '',
    'END:VCALENDAR',
  ].join('\r\n');

  return ics;
}

export function formatICSForDownload(ics: string): string {
  // Adicionar BOM para UTF-8 se necessário
  return '\ufeff' + ics;
}
