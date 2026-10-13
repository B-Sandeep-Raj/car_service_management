import 'dotenv/config';
import { dbEngine } from '../server/db';

const force = process.argv.includes('--force');

try {
  const result = await dbEngine.seedDemoData(force);
  console.log(
    `${force ? 'Reset and seeded' : 'Seeded safely'} ${result.inserted} records; ` +
    `${result.skipped} existing records were left unchanged.`,
  );
} finally {
  await dbEngine.close();
}
