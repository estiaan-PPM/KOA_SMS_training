import type { Config } from 'drizzle-kit';
import { ConfigService } from '@nestjs/config';
import 'dotenv/config';

const configService = new ConfigService();

export default {
  schema: './src/database/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    host: configService.get('POSTGRES_HOST', 'localhost'),
    port: configService.get('POSTGRES_PORT', 5432),
    user: configService.get('POSTGRES_USER', 'postgres'),
    password: configService.get('POSTGRES_PASSWORD', 'password'),
    database: configService.get('POSTGRES_DB', 'nestjs_db'),
  },
} satisfies Config;