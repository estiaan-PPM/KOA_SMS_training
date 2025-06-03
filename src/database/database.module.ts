// src/database/database.module.ts (Dynamic only)
import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { DatabaseService } from './database.service';

export interface DatabaseOptions {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
}

export const CONNECTION_POOL = 'CONNECTION_POOL';

@Global()
@Module({})
export class DatabaseModule {
  static forRootAsync(options: {
    imports: any[];
    inject: any[];
    useFactory: (configService: ConfigService) => DatabaseOptions;
  }): DynamicModule {
    return {
      module: DatabaseModule,
      imports: options.imports,
      providers: [
        {
          provide: CONNECTION_POOL,
          inject: options.inject,
          useFactory: (configService: ConfigService) => {
            const dbOptions = options.useFactory(configService);
            return new Pool({
              host: dbOptions.host,
              port: dbOptions.port,
              user: dbOptions.user,
              password: dbOptions.password,
              database: dbOptions.database,
              ssl: dbOptions.ssl ? { rejectUnauthorized: false } : false,
              max: 20,
              idleTimeoutMillis: 30000,
              connectionTimeoutMillis: 2000,
            });
          },
        },
        DatabaseService,
      ],
      exports: [DatabaseService],
      global: true,
    };
  }
}