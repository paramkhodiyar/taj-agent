import { prisma } from '../lib/prisma';

export async function applyImmutableTrigger() {
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION prevent_price_snapshot_mutation()
    RETURNS TRIGGER AS $$
    BEGIN
      RAISE EXCEPTION 'PriceSnapshot is strictly immutable per 03-DATA-AND-AGENT.md §7. Updates and deletes are prohibited.';
    END;
    $$ LANGUAGE plpgsql;
  `);

  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS trg_price_snapshot_immutable ON "PriceSnapshot";
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER trg_price_snapshot_immutable
    BEFORE UPDATE OR DELETE ON "PriceSnapshot"
    FOR EACH ROW
    EXECUTE FUNCTION prevent_price_snapshot_mutation();
  `);

  console.log('✓ Immutable PostgreSQL trigger applied successfully to "PriceSnapshot".');
}

if (process.argv[1]?.endsWith('apply-immutable-trigger.ts')) {
  applyImmutableTrigger()
    .catch((err) => {
      console.error('Failed to apply immutable trigger:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
