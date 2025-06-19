import { Controller, Get } from '@nestjs/common';
import { DrizzleService } from '../database/drizzle.service';

@Controller('health')
export class HealthController {
  constructor(private readonly drizzleService: DrizzleService) {}

  @Get()
  async checkHealth() {
    try {
      // Test database connection
      const result = await this.drizzleService.db.execute('SELECT 1 as test');
      
      return {
        status: 'OK',
        database: 'Connected',
        timestamp: new Date().toISOString(),
        result: result.rows,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        status: 'ERROR',
        database: 'Disconnected',
        timestamp: new Date().toISOString(),
        error: errorMessage,
      };
    }
  }

  @Get('tables')
  async checkTables() {
    try {
      // Check if tables exist
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      const result = await this.drizzleService.db.execute(tablesQuery);
      
      return {
        status: 'OK',
        tables: result.rows,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        status: 'ERROR',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }
}