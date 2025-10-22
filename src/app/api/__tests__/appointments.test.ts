import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../appointments/route';

// Mock do Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    service: {
      findMany: vi.fn(),
    },
    appointment: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    appointmentService: {
      create: vi.fn(),
    },
    appointmentStatusHistory: {
      create: vi.fn(),
    },
  },
}));

// Mock das funções de scheduling
vi.mock('@/lib/scheduling/slots', () => ({
  generateFreeWindows: vi.fn(),
  generateSlots: vi.fn(),
}));

vi.mock('@/lib/scheduling/recommendation', () => ({
  getRecommendedBarber: vi.fn(),
}));

describe('Appointments API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/appointments', () => {
    it('should create appointment successfully', async () => {
      const { prisma } = await import('@/lib/prisma');

      // Mock dos serviços
      prisma.service.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'Corte',
          durationMinutes: 30,
          bufferMinutes: 5,
          priceCents: 2500,
        },
        {
          id: '2',
          name: 'Barba',
          durationMinutes: 20,
          bufferMinutes: 5,
          priceCents: 1500,
        },
      ]);

      // Mock da transação
      prisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          appointment: {
            create: vi.fn().mockResolvedValue({
              id: 'appointment-1',
              barberId: 'barber-1',
              barbershopId: 'shop-1',
              customerName: 'João Silva',
              customerPhone: '(11) 99999-9999',
              startsAt: new Date('2024-01-20T14:00:00Z'),
              endsAt: new Date('2024-01-20T14:55:00Z'),
              status: 'CONFIRMED',
            }),
            findMany: vi.fn().mockResolvedValue([]), // Para checkBarberAvailability
          },
          appointmentService: {
            create: vi.fn().mockResolvedValue({}),
          },
          appointmentStatusHistory: {
            create: vi.fn().mockResolvedValue({}),
          },
          blockedTime: {
            findMany: vi.fn().mockResolvedValue([]), // Para checkBarberAvailability
          },
        };
        return callback(mockTx);
      });

      const request = new NextRequest('http://localhost/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          barbershopId: 'shop-1',
          barberId: 'barber-1',
          serviceIds: ['1', '2'],
          startsAt: '2024-01-20T14:00:00Z',
          customerName: 'João Silva',
          customerPhone: '(11) 99999-9999',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.appointment).toBeDefined();
      expect(data.message).toBe('Agendamento criado com sucesso');
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          barbershopId: 'shop-1',
          // Missing other required fields
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Dados obrigatórios não fornecidos');
    });

    it('should return 400 for invalid services', async () => {
      const { prisma } = await import('@/lib/prisma');

      prisma.service.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'Corte',
          durationMinutes: 30,
          bufferMinutes: 5,
          priceCents: 2500,
        },
      ]);

      const request = new NextRequest('http://localhost/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          barbershopId: 'shop-1',
          barberId: 'barber-1',
          serviceIds: ['1', '999'], // 999 não existe
          startsAt: '2024-01-20T14:00:00Z',
          customerName: 'João Silva',
          customerPhone: '(11) 99999-9999',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Um ou mais serviços não encontrados');
    });

    it('should return 409 for slot conflict', async () => {
      const { prisma } = await import('@/lib/prisma');

      prisma.service.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'Corte',
          durationMinutes: 30,
          bufferMinutes: 5,
          priceCents: 2500,
        },
      ]);

      // Mock da transação que simula conflito
      prisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          appointment: {
            create: vi.fn().mockRejectedValue(new Error('Slot indisponível')),
            findMany: vi.fn().mockResolvedValue([]), // Para checkBarberAvailability
          },
          blockedTime: {
            findMany: vi.fn().mockResolvedValue([]), // Para checkBarberAvailability
          },
        };
        return callback(mockTx);
      });

      const request = new NextRequest('http://localhost/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          barbershopId: 'shop-1',
          barberId: 'barber-1',
          serviceIds: ['1'],
          startsAt: '2024-01-20T14:00:00Z',
          customerName: 'João Silva',
          customerPhone: '(11) 99999-9999',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Slot indisponível. Tente outro horário.');
    });
  });
});
