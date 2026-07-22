import { defineConfig } from 'prisma/config';
import path from 'node:path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '.env') });

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
});
