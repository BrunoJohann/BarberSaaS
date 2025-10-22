export interface WorkingPeriod {
  id: string;
  barberId: string;
  barbershopId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive: boolean;
}

export interface BlockedTime {
  id: string;
  barberId: string;
  barbershopId: string;
  startsAt: Date;
  endsAt: Date;
  reason: string;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  barberId: string | null;
  barbershopId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  startsAt: Date;
  endsAt: Date;
  status: 'CONFIRMED' | 'CANCELED' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentService {
  id: string;
  appointmentId: string;
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  bufferMinutes: number;
  priceCents: number;
}

export interface FreeWindow {
  start: Date;
  end: Date;
}

export interface Slot {
  start: Date;
  end: Date;
  barberOptions: BarberOption[];
  recommendedBarberId: string;
}

export interface BarberOption {
  barberId: string;
  barberName: string;
}

export interface SlotGranularity {
  barbershopId: string;
  granularityMinutes: number;
  lastUpdated: Date;
}

export interface AppointmentStatusHistory {
  id: string;
  appointmentId: string;
  fromStatus: string | null;
  toStatus: string;
  createdAt: Date;
  reason?: string;
}
