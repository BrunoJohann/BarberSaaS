import { prisma } from '@/lib/db/prisma';
import { env } from '@/lib/env';

const cache = new Map<string, { value: number; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function getSlotGranularityMinutes(
  barbershopId: string
): Promise<number> {
  const now = Date.now();
  const cached = cache.get(barbershopId);

  if (cached && cached.expires > now) {
    return cached.value;
  }

  try {
    const settings = await prisma.barbershopSettings.findUnique({
      where: { barbershopId },
      select: { slotGranularity: true },
    });

    let granularity = settings?.slotGranularity;

    // Validação: deve estar entre 5 e 60 e ser divisor de 60
    if (
      granularity &&
      granularity >= 5 &&
      granularity <= 60 &&
      60 % granularity === 0
    ) {
      cache.set(barbershopId, { value: granularity, expires: now + CACHE_TTL });
      return granularity;
    }

    // Fallback para .env
    const fallback = env.SLOT_GRANULARITY_MINUTES;
    if (fallback >= 5 && fallback <= 60 && 60 % fallback === 0) {
      cache.set(barbershopId, { value: fallback, expires: now + CACHE_TTL });
      return fallback;
    }

    // Fallback final: 15 minutos
    const defaultGranularity = 15;
    cache.set(barbershopId, {
      value: defaultGranularity,
      expires: now + CACHE_TTL,
    });
    return defaultGranularity;
  } catch (error) {
    console.error('Erro ao buscar granularidade de slots:', error);
    return env.SLOT_GRANULARITY_MINUTES;
  }
}

export function clearSlotGranularityCache(barbershopId?: string): void {
  if (barbershopId) {
    cache.delete(barbershopId);
  } else {
    cache.clear();
  }
}
