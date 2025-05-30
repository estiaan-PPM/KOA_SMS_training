import { Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';

import { DrizzleService } from '../database/drizzle.service';

@Injectable()
export class HealthService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async check() {
    let databaseStatus = 'disconnected';
    
    try {
      // Simple database check using sql template
      await this.drizzleService.db.execute(sql`SELECT 1`);
      databaseStatus = 'connected';
    } catch (error) {
      databaseStatus = 'disconnected';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: databaseStatus,
    };
  }
}