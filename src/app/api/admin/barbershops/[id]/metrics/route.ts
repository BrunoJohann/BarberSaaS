import { getBarbershopMetrics } from '@/lib/metrics';
import { addDays, parseISO } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server';

// Cache simples em memória
const metricsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 60 segundos

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: barbershopId } = params;
    const { searchParams } = new URL(request.url);

    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    // Valores padrão: últimos 30 dias
    const fromDate = fromParam ? parseISO(fromParam) : addDays(new Date(), -30);
    const toDate = toParam ? parseISO(toParam) : new Date();

    // Verificar cache
    const cacheKey = `${barbershopId}-${fromDate.toISOString()}-${toDate.toISOString()}`;
    const cached = metricsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Buscar métricas
    const metrics = await getBarbershopMetrics(barbershopId, fromDate, toDate);

    // Armazenar no cache
    metricsCache.set(cacheKey, {
      data: metrics,
      timestamp: Date.now(),
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Limpar cache periodicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of metricsCache) {
    if (now - value.timestamp > CACHE_TTL) {
      metricsCache.delete(key);
    }
  }
}, CACHE_TTL);
