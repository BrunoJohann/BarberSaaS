// Simple environment configuration for MVP
export const env = {
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://user:password@localhost:5432/barber_mvp',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'changeme',
  APP_DEFAULT_TIMEZONE: process.env.APP_DEFAULT_TIMEZONE || 'America/Sao_Paulo',
  SLOT_GRANULARITY_MINUTES: Number.parseInt(
    process.env.SLOT_GRANULARITY_MINUTES || '15'
  ),
};
