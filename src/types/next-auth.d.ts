import { UserRole } from '@prisma/client';
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      tenantId: string;
      tenant?: {
        id: string;
        name: string;
        slug: string;
      };
      staffBarbershops?: Array<{
        barbershopId: string;
        barbershop: {
          id: string;
          name: string;
          slug: string;
        };
      }>;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    tenantId: string;
    tenant?: {
      id: string;
      name: string;
      slug: string;
    };
    staffBarbershops?: Array<{
      barbershopId: string;
      barbershop: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    tenantId: string;
    tenant?: {
      id: string;
      name: string;
      slug: string;
    };
    staffBarbershops?: Array<{
      barbershopId: string;
      barbershop: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
  }
}
