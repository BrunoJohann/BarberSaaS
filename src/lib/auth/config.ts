import { prisma } from '@/lib/db/prisma';
import { UserRole } from '@prisma/client';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              tenant: true,
              staffBarbershops: {
                include: {
                  barbershop: true,
                },
              },
            },
          });

          if (!user) {
            return null;
          }

          // Simple password verification for MVP
          if (
            credentials.password === 'owner123' &&
            user.role === UserRole.OWNER
          ) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              tenantId: user.tenantId,
              tenant: user.tenant,
              staffBarbershops: user.staffBarbershops,
            };
          }

          if (
            credentials.password === 'staff123' &&
            user.role === UserRole.STAFF
          ) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              tenantId: user.tenantId,
              tenant: user.tenant,
              staffBarbershops: user.staffBarbershops,
            };
          }

          return null;
        } catch (error) {
          console.error('Erro na autenticação:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenant = user.tenant;
        token.staffBarbershops = user.staffBarbershops;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId as string;
        session.user.tenant = token.tenant;
        session.user.staffBarbershops = token.staffBarbershops;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};
