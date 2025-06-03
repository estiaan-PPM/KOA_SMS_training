// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import { ConfigService } from '@nestjs/config';
import 'dotenv/config';

const configService = new ConfigService();

export default defineConfig({
  schema: './src/database/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: configService.get('POSTGRES_HOST') || 'localhost',
    port: parseInt(configService.get('POSTGRES_PORT')) || 5432,
    user: configService.get('POSTGRES_USER') || 'postgres',
    password: configService.get('POSTGRES_PASSWORD') || 'password',
    database: configService.get('POSTGRES_DB') || 'koa_academy',
    ssl: configService.get('POSTGRES_SSL') === 'true',
  },
  verbose: true,
  strict: true,
});

