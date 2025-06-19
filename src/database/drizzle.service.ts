import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { CONNECTION_POOL } from './database.module-definition';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { databaseSchema } from './database-schema';

@Injectable()
export class DrizzleService {
  private readonly logger = new Logger(DrizzleService.name);
  public db: NodePgDatabase<typeof databaseSchema>;

  constructor(@Inject(CONNECTION_POOL) private readonly pool: Pool) {
    this.logger.log('Initializing DrizzleService...');
    this.db = drizzle(this.pool, { schema: databaseSchema });
    this.logger.log('DrizzleService initialized successfully');
    
    // Test the connection
    this.testConnection();
  }

  private async testConnection() {
    try {
      const result = await this.pool.query('SELECT NOW()');
      this.logger.log('Database connection test successful');
      this.logger.log(`Database time: ${result.rows[0].now}`);
    } catch (error) {
      this.logger.error('Database connection test failed:', error);
    }
  }
}