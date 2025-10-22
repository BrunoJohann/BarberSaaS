import { generateFreeWindows, generateSlots } from '@/lib/scheduling/slots';
import { getBarbershopTimezone } from '@/lib/scheduling/timezone';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barbershopId = searchParams.get('barbershopId');
    const barberId = searchParams.get('barberId');
    const date = searchParams.get('date');
    const serviceIds = searchParams.get('serviceIds')?.split(',') || [];

    if (!barbershopId || !date) {
      return NextResponse.json(
        { error: 'barbershopId e date são obrigatórios' },
        { status: 400 }
      );
    }

    // Em produção, buscar dados do banco
    const workingPeriods = await getWorkingPeriods(barbershopId, barberId);
    const blockedTimes = await getBlockedTimes(barbershopId, barberId, date);
    const appointments = await getAppointments(barbershopId, barberId, date);
    const services = await getServices(serviceIds);

    const totalDurationMinutes = services.reduce(
      (total, service) =>
        total + service.durationMinutes + service.bufferMinutes,
      0
    );

    const appointmentDate = new Date(date);
    const freeWindows = generateFreeWindows(
      workingPeriods,
      blockedTimes,
      appointments,
      appointmentDate,
      barbershopId,
      barberId || undefined
    );

    const slots = generateSlots(
      freeWindows,
      totalDurationMinutes,
      barbershopId,
      barberId || undefined
    );

    // Converter para formato de resposta com timezone local
    const timezone = getBarbershopTimezone(barbershopId);
    const response = slots.map((slot) => ({
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
      startLocal: formatTimeInBarbershopTimezone(slot.start, barbershopId),
      endLocal: formatTimeInBarbershopTimezone(slot.end, barbershopId),
      barberOptions: slot.barberOptions,
      recommendedBarberId: slot.recommendedBarberId,
    }));

    return NextResponse.json({ slots: response });
  } catch (error) {
    console.error('Erro ao buscar slots:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Funções mock - em produção, implementar com Prisma
async function getWorkingPeriods(
  barbershopId: string,
  barberId?: string | null
) {
  // Mock data
  return [
    {
      id: '1',
      barberId: '1',
      barbershopId,
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '18:00',
      isActive: true,
    },
    {
      id: '2',
      barberId: '2',
      barbershopId,
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '18:00',
      isActive: true,
    },
  ].filter((wp) => !barberId || wp.barberId === barberId);
}

async function getBlockedTimes(
  barbershopId: string,
  barberId?: string | null,
  date?: string
) {
  // Mock data - em produção, buscar do banco
  return [];
}

async function getAppointments(
  barbershopId: string,
  barberId?: string | null,
  date?: string
) {
  // Mock data - em produção, buscar do banco
  return [];
}

async function getServices(serviceIds: string[]) {
  // Mock data - em produção, buscar do banco
  const allServices = [
    { id: '1', name: 'Corte Masculino', durationMinutes: 30, bufferMinutes: 5 },
    { id: '2', name: 'Barba', durationMinutes: 20, bufferMinutes: 5 },
    { id: '3', name: 'Sobrancelha', durationMinutes: 15, bufferMinutes: 5 },
  ];

  return serviceIds.length > 0
    ? allServices.filter((s) => serviceIds.includes(s.id))
    : allServices;
}

function formatTimeInBarbershopTimezone(
  date: Date,
  barbershopId: string
): string {
  // Implementação simplificada - em produção usar date-fns-tz
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
}
