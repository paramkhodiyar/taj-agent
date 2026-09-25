import { runScheduledCollector } from './scheduledCollector';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Isolated Agent Worker Process (docs/06-DEPLOYMENT-AND-OPERATIONS.md §1 & §2)
 * Runs as a separate long-lived daemon process outside the Next.js request/response cycle.
 */
async function startWorker() {
  console.log('====================================================');
  console.log('Taj Price Intelligence — Dedicated Agent Worker Process');
  console.log('Operational isolation: Node Worker Process');
  console.log('====================================================');

  const intervalMinutes = parseInt(process.env.SCHEDULE_INTERVAL_MINUTES || '60', 10);
  console.log(`Worker initialized. Periodic collection interval: every ${intervalMinutes} minutes.`);

  // Immediate cycle on boot
  try {
    console.log('\n[Worker] Running scheduled collection cycle on boot...');
    const result = await runScheduledCollector();
    console.log(
      `[Worker] Cycle complete at ${result.completedAt}: Processed ${result.trackedSearchesProcessed} tracked searches, ${result.newSnapshotsCount} new snapshots.`
    );
  } catch (err: any) {
    console.error('[Worker] Initial cycle error:', err.message);
  }

  // Periodic interval loop
  setInterval(async () => {
    try {
      console.log(`\n[Worker] Running scheduled collection cycle at ${new Date().toISOString()}...`);
      const result = await runScheduledCollector();
      console.log(
        `[Worker] Cycle complete: Processed ${result.trackedSearchesProcessed} tracked searches, ${result.newSnapshotsCount} new snapshots, ${result.digestsGenerated.length} digests generated.`
      );
    } catch (err: any) {
      console.error('[Worker] Periodic cycle error:', err.message);
    }
  }, intervalMinutes * 60 * 1000);
}

startWorker();
