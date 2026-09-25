import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set in environment.');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query('SELECT current_database(), current_user, version();');
    console.log('PostgreSQL Database Connected Successfully:');
    console.log({
      database: res.rows[0].current_database,
      user: res.rows[0].current_user,
      version: res.rows[0].version.split('\n')[0],
    });
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Failed to connect to PostgreSQL database:', err);
    process.exit(1);
  }
}

main();
