export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: Array<{
    email: string;
    name: string;
  }>;
}

export interface BarberIcsFeed {
  barberId: string;
  events: CalendarEvent[];
}

export interface CalendarService {
  publishAppointment(appointmentId: string): Promise<void>;
  updateAppointment(appointmentId: string): Promise<void>;
  deleteAppointment(appointmentId: string): Promise<void>;
  getBarberIcsFeed(barberId: string): Promise<string>;
  getSingleEventIcs(appointmentId: string): Promise<string>;
}
