// src/database/database.module.ts (Updated)
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
@Module({
  providers: [
    DatabaseService,
    {
      provide: CONNECTION_POOL,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { Pool } = await import('pg');
        return new Pool({
          host: configService.get('POSTGRES_HOST'),
          port: configService.get('POSTGRES_PORT'),
          user: configService.get('POSTGRES_USER'),
          password: configService.get('POSTGRES_PASSWORD'),
          database: configService.get('POSTGRES_DB'),
          ssl: configService.get('POSTGRES_SSL') === 'true' ? { rejectUnauthorized: false } : false,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        });
      },
    },
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {
  static forRootAsync(options: {
    imports: any[];
    inject: any[];
    useFactory: (configService: ConfigService) => DatabaseOptions;
  }) {
    return {
      module: DatabaseModule,
      imports: options.imports,
      providers: [
        DatabaseService,
        {
          provide: CONNECTION_POOL,
          inject: options.inject,
          useFactory: async (configService: ConfigService) => {
            const dbOptions = options.useFactory(configService);
            const { Pool } = await import('pg');
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
      ],
      exports: [DatabaseService],
    };
  }
}

