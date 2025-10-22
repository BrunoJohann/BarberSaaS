import { describe, expect, it, vi } from 'vitest';
import { getBarberWorkload, getRecommendedBarber } from '../recommendation';

describe('Barber Recommendation', () => {
  describe('getRecommendedBarber', () => {
    it('should recommend barber with fewer appointments', async () => {
      const mockTx = {
        barber: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: '1',
              name: 'João Silva',
              services: [{ serviceId: '1' }, { serviceId: '2' }],
              createdAt: new Date('2024-01-01'),
            },
            {
              id: '2',
              name: 'Maria Santos',
              services: [{ serviceId: '1' }, { serviceId: '2' }],
              createdAt: new Date('2024-01-02'),
            },
          ]),
        },
        appointment: {
          findMany: vi.fn().mockImplementation(({ where }) => {
            if (where.barberId === '1') {
              return Promise.resolve([
                { id: '1', startsAt: new Date(), endsAt: new Date() },
              ]);
            }
            return Promise.resolve([]); // Maria tem 0 agendamentos
          }),
        },
      };

      const recommended = await getRecommendedBarber(
        'test-shop',
        new Date('2024-01-20'),
        ['1', '2'],
        mockTx
      );

      expect(recommended).toBe('2'); // Maria tem menos agendamentos
    });

    it('should use createdAt as tiebreaker', async () => {
      const mockTx = {
        barber: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: '1',
              name: 'João Silva',
              services: [{ serviceId: '1' }],
              createdAt: new Date('2024-01-02'), // Mais recente
            },
            {
              id: '2',
              name: 'Maria Santos',
              services: [{ serviceId: '1' }],
              createdAt: new Date('2024-01-01'), // Mais antiga
            },
          ]),
        },
        appointment: {
          findMany: vi.fn().mockResolvedValue([]), // Ambos têm 0 agendamentos
        },
      };

      const recommended = await getRecommendedBarber(
        'test-shop',
        new Date('2024-01-20'),
        ['1'],
        mockTx
      );

      expect(recommended).toBe('2'); // Maria foi criada primeiro
    });

    it('should throw error when no barbers available', async () => {
      const mockTx = {
        barber: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      await expect(
        getRecommendedBarber('test-shop', new Date('2024-01-20'), ['1'], mockTx)
      ).rejects.toThrow(
        'Nenhum barbeiro disponível para os serviços selecionados'
      );
    });

    it('should throw error when no barber executes all services', async () => {
      const mockTx = {
        barber: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: '1',
              name: 'João Silva',
              services: [{ serviceId: '1' }], // Só executa serviço 1
              createdAt: new Date('2024-01-01'),
            },
          ]),
        },
      };

      await expect(
        getRecommendedBarber(
          'test-shop',
          new Date('2024-01-20'),
          ['1', '2'],
          mockTx
        )
      ).rejects.toThrow(
        'Nenhum barbeiro executa todos os serviços selecionados'
      );
    });
  });

  describe('getBarberWorkload', () => {
    it('should calculate workload correctly', async () => {
      const mockTx = {
        appointment: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: '1',
              startsAt: new Date('2024-01-20T09:00:00Z'),
              endsAt: new Date('2024-01-20T09:30:00Z'), // 30 min
            },
            {
              id: '2',
              startsAt: new Date('2024-01-20T10:00:00Z'),
              endsAt: new Date('2024-01-20T10:45:00Z'), // 45 min
            },
          ]),
        },
        workingPeriod: {
          findMany: vi.fn().mockResolvedValue([
            {
              startTime: '09:00',
              endTime: '18:00', // 9 horas = 540 min
            },
          ]),
        },
        blockedTime: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      const workload = await getBarberWorkload(
        'barber-1',
        'test-shop',
        new Date('2024-01-20'),
        mockTx
      );

      expect(workload.appointmentCount).toBe(2);
      expect(workload.totalWorkedMinutes).toBe(75); // 30 + 45
      expect(workload.capacityMinutes).toBe(540);
      expect(workload.occupancyRate).toBeCloseTo(0.139, 2); // 75/540
    });
  });
});
