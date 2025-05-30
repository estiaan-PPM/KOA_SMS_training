import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Health check successful',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        timestamp: { type: 'string' },
        uptime: { type: 'number' },
        database: { type: 'string' },
      },
    },
  })
  check() {
    return this.healthService.check();
  }
}