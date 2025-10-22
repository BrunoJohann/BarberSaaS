import { SlotGranularity } from './types';

// Cache in-memory para granularidade
const granularityCache = new Map<string, SlotGranularity>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export function getSlotGranularityMinutes(barbershopId: string): number {
  const cached = granularityCache.get(barbershopId);

  if (cached && Date.now() - cached.lastUpdated.getTime() < CACHE_TTL) {
    return cached.granularityMinutes;
  }

  // Em produção, buscar do banco de dados
  // Por enquanto, usar valor padrão do .env
  const defaultGranularity = parseInt(
    process.env.DEFAULT_SLOT_GRANULARITY_MINUTES || '15'
  );

  const granularity: SlotGranularity = {
    barbershopId,
    granularityMinutes: defaultGranularity,
    lastUpdated: new Date(),
  };

  granularityCache.set(barbershopId, granularity);
  return granularity.granularityMinutes;
}

export function setSlotGranularityMinutes(
  barbershopId: string,
  granularityMinutes: number
): void {
  if (!isValidGranularity(granularityMinutes)) {
    throw new Error(
      'Granularidade inválida. Deve ser entre 5 e 60 minutos e divisor de 60.'
    );
  }

  const granularity: SlotGranularity = {
    barbershopId,
    granularityMinutes,
    lastUpdated: new Date(),
  };

  granularityCache.set(barbershopId, granularity);
}

export function isValidGranularity(granularityMinutes: number): boolean {
  return (
    granularityMinutes >= 5 &&
    granularityMinutes <= 60 &&
    60 % granularityMinutes === 0
  );
}

export function getValidGranularityOptions(): number[] {
  return [5, 10, 15, 20, 30, 60];
}

export function clearGranularityCache(barbershopId?: string): void {
  if (barbershopId) {
    granularityCache.delete(barbershopId);
  } else {
    granularityCache.clear();
  }
}
