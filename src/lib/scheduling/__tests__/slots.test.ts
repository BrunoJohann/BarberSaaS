import { describe, expect, it } from 'vitest';
import { generateSlots, generateStartsOnGrid } from '../slots';
import { FreeWindow } from '../types';

describe('Slots Generation', () => {
  describe('generateStartsOnGrid', () => {
    it('should generate slots with 15min granularity for 45min duration', () => {
      const freeWindows: FreeWindow[] = [
        {
          start: new Date('2024-01-20T09:30:00Z'),
          end: new Date('2024-01-20T12:00:00Z'),
        },
      ];

      const totalDurationMinutes = 45;
      const granularityMinutes = 15;

      const starts = generateStartsOnGrid(
        freeWindows,
        totalDurationMinutes,
        granularityMinutes
      );

      // Deve gerar: 09:30, 09:45, 10:00, 10:15, 10:30, 10:45, 11:00, 11:15
      // 11:30 não cabe (11:30 + 45min = 12:15 > 12:00)
      expect(starts).toHaveLength(7);
      expect(starts[0]).toEqual(new Date('2024-01-20T09:30:00Z'));
      expect(starts[1]).toEqual(new Date('2024-01-20T09:45:00Z'));
      expect(starts[6]).toEqual(new Date('2024-01-20T11:00:00Z'));
    });

    it('should generate slots with 30min granularity for 45min duration', () => {
      const freeWindows: FreeWindow[] = [
        {
          start: new Date('2024-01-20T09:00:00Z'),
          end: new Date('2024-01-20T12:00:00Z'),
        },
      ];

      const totalDurationMinutes = 45;
      const granularityMinutes = 30;

      const starts = generateStartsOnGrid(
        freeWindows,
        totalDurationMinutes,
        granularityMinutes
      );

      // Deve gerar: 09:00, 09:30, 10:00, 10:30, 11:00
      // 11:30 não cabe (11:30 + 45min = 12:15 > 12:00)
      expect(starts).toHaveLength(5);
      expect(starts[0]).toEqual(new Date('2024-01-20T09:00:00Z'));
      expect(starts[1]).toEqual(new Date('2024-01-20T09:30:00Z'));
      expect(starts[4]).toEqual(new Date('2024-01-20T11:00:00Z'));
    });

    it('should handle multiple free windows', () => {
      const freeWindows: FreeWindow[] = [
        {
          start: new Date('2024-01-20T09:00:00Z'),
          end: new Date('2024-01-20T10:00:00Z'),
        },
        {
          start: new Date('2024-01-20T11:00:00Z'),
          end: new Date('2024-01-20T12:00:00Z'),
        },
      ];

      const totalDurationMinutes = 30;
      const granularityMinutes = 15;

      const starts = generateStartsOnGrid(
        freeWindows,
        totalDurationMinutes,
        granularityMinutes
      );

      // Primeira janela: 09:00, 09:15, 09:30
      // Segunda janela: 11:00, 11:15, 11:30
      expect(starts).toHaveLength(4);
      expect(starts[0]).toEqual(new Date('2024-01-20T09:00:00Z'));
      expect(starts[2]).toEqual(new Date('2024-01-20T11:00:00Z'));
      expect(starts[3]).toEqual(new Date('2024-01-20T11:15:00Z'));
    });

    it('should return empty array when no slots fit', () => {
      const freeWindows: FreeWindow[] = [
        {
          start: new Date('2024-01-20T09:00:00Z'),
          end: new Date('2024-01-20T09:30:00Z'),
        },
      ];

      const totalDurationMinutes = 60; // Muito longo para a janela
      const granularityMinutes = 15;

      const starts = generateStartsOnGrid(
        freeWindows,
        totalDurationMinutes,
        granularityMinutes
      );

      expect(starts).toHaveLength(0);
    });
  });

  describe('generateSlots', () => {
    it('should generate slots with barber options for "sem preferência"', () => {
      const freeWindows: FreeWindow[] = [
        {
          start: new Date('2024-01-20T09:00:00Z'),
          end: new Date('2024-01-20T10:00:00Z'),
        },
      ];

      const totalDurationMinutes = 30;
      const barbershopId = 'test-shop';

      const slots = generateSlots(
        freeWindows,
        totalDurationMinutes,
        barbershopId
      );

      expect(slots).toHaveLength(2); // 09:00 e 09:30
      expect(slots[0].barberOptions).toBeDefined();
      expect(slots[0].recommendedBarberId).toBeDefined();
    });
  });
});
