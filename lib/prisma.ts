import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma;

/**
 * Enhanced Prisma client enforcing 03-DATA-AND-AGENT.md §7:
 * "Never update an old price... Snapshots are strictly append-only by construction."
 */
export const prisma = basePrisma.$extends({
  query: {
    priceSnapshot: {
      async update() {
        throw new Error(
          'CRITICAL VIOLATION: PriceSnapshot is strictly immutable per docs/03-DATA-AND-AGENT.md §7. Updates are prohibited.'
        );
      },
      async updateMany() {
        throw new Error(
          'CRITICAL VIOLATION: PriceSnapshot is strictly immutable per docs/03-DATA-AND-AGENT.md §7. Bulk updates are prohibited.'
        );
      },
      async upsert() {
        throw new Error(
          'CRITICAL VIOLATION: PriceSnapshot is strictly immutable per docs/03-DATA-AND-AGENT.md §7. Upserts are prohibited. Always create a new snapshot.'
        );
      },
      async delete() {
        throw new Error(
          'CRITICAL VIOLATION: PriceSnapshot is strictly immutable per docs/03-DATA-AND-AGENT.md §7. Deletions are prohibited.'
        );
      },
      async deleteMany() {
        throw new Error(
          'CRITICAL VIOLATION: PriceSnapshot is strictly immutable per docs/03-DATA-AND-AGENT.md §7. Bulk deletions are prohibited.'
        );
      },
    },
  },
});

export default prisma;
