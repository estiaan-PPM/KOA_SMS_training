import { Global, Module, DynamicModule } from '@nestjs/common';
import { Pool } from 'pg';

import { DrizzleService } from './drizzle.service';
import { DatabaseOptions } from './database-options.interface';

export const CONNECTION_POOL = 'CONNECTION_POOL';
export const DATABASE_OPTIONS = 'DATABASE_OPTIONS';

@Global()
@Module({})
export class DatabaseModule {
  static forRootAsync(options: {
    imports?: any[];
    inject?: any[];
    useFactory: (...args: any[]) => DatabaseOptions | Promise<DatabaseOptions>;
  }): DynamicModule {
    return {
      module: DatabaseModule,
      imports: options.imports || [],
      providers: [
        {
          provide: DATABASE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: CONNECTION_POOL,
          inject: [DATABASE_OPTIONS],
          useFactory: (databaseOptions: DatabaseOptions) => {
            return new Pool({
              host: databaseOptions.host,
              port: databaseOptions.port,
              user: databaseOptions.user,
              password: databaseOptions.password,
              database: databaseOptions.database,
            });
          },
        },
        DrizzleService,
      ],
      exports: [DrizzleService],
    };
  }
}