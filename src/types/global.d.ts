declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      APP_DEFAULT_TIMEZONE: string;
      SLOT_GRANULARITY_MINUTES: string;
    }
  }
}

export {};
