// src/audit/audit.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '../database/schema';
import { CreateAuditLog, AuditLog, TenantContext } from '../database/types';
import { eq, and, desc } from 'drizzle-orm';

export interface AuditLogEntry {
  actionType: string;
  entityType: string;
  entityId?: number;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly databaseService: DatabaseService) {}

  async logAction(
    auditData: AuditLogEntry,
    context: Partial<TenantContext> & { userId?: number; userRole?: string },
  ): Promise<AuditLog> {
    const auditLog: CreateAuditLog = {
      schoolId: context.schoolId || null,
      userId: context.userId || null,
      userRole: context.userRole || null,
      actionType: auditData.actionType,
      entityType: auditData.entityType,
      entityId: auditData.entityId || null,
      oldValues: auditData.oldValues || null,
      newValues: auditData.newValues || null,
      ipAddress: auditData.ipAddress || null,
      userAgent: auditData.userAgent || null,
    };

    const [createdLog] = await this.databaseService.db
      .insert(schema.systemAuditLog)
      .values(auditLog)
      .returning();

    return createdLog;
  }

  async getAuditLogs(
    context: TenantContext,
    options: {
      entityType?: string;
      entityId?: number;
      userId?: number;
      actionType?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<AuditLog[]> {
    const { entityType, entityId, userId, actionType, limit = 50, offset = 0 } = options;

    let whereConditions = [eq(schema.systemAuditLog.schoolId, context.schoolId)];

    if (entityType) {
      whereConditions.push(eq(schema.systemAuditLog.entityType, entityType));
    }

    if (entityId !== undefined) {
      whereConditions.push(eq(schema.systemAuditLog.entityId, entityId));
    }

    if (userId !== undefined) {
      whereConditions.push(eq(schema.systemAuditLog.userId, userId));
    }

    if (actionType) {
      whereConditions.push(eq(schema.systemAuditLog.actionType, actionType));
    }

    return await this.databaseService.db.query.systemAuditLog.findMany({
      where: and(...whereConditions),
      orderBy: [desc(schema.systemAuditLog.timestamp)],
      limit,
      offset,
    });
  }

  async getEntityHistory(
    entityType: string,
    entityId: number,
    context: TenantContext,
  ): Promise<AuditLog[]> {
    return await this.getAuditLogs(context, { entityType, entityId });
  }

  async getUserActivity(
    userId: number,
    context: TenantContext,
    limit: number = 20,
  ): Promise<AuditLog[]> {
    return await this.getAuditLogs(context, { userId, limit });
  }

  // Common audit actions
  async logLogin(userId: number, context: Partial<TenantContext>, ipAddress?: string, userAgent?: string) {
    return this.logAction(
      {
        actionType: 'LOGIN',
        entityType: 'UserAccount',
        entityId: userId,
        ipAddress,
        userAgent,
      },
      { ...context, userId },
    );
  }

  async logLogout(userId: number, context: Partial<TenantContext>, ipAddress?: string) {
    return this.logAction(
      {
        actionType: 'LOGOUT',
        entityType: 'UserAccount',
        entityId: userId,
        ipAddress,
      },
      { ...context, userId },
    );
  }

  async logCreate(
    entityType: string,
    entityId: number,
    newValues: Record<string, any>,
    context: TenantContext,
  ) {
    return this.logAction(
      {
        actionType: 'CREATE',
        entityType,
        entityId,
        newValues,
      },
      context,
    );
  }

  async logUpdate(
    entityType: string,
    entityId: number,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    context: TenantContext,
  ) {
    return this.logAction(
      {
        actionType: 'UPDATE',
        entityType,
        entityId,
        oldValues,
        newValues,
      },
      context,
    );
  }

  async logDelete(
    entityType: string,
    entityId: number,
    oldValues: Record<string, any>,
    context: TenantContext,
  ) {
    return this.logAction(
      {
        actionType: 'DELETE',
        entityType,
        entityId,
        oldValues,
      },
      context,
    );
  }

  async logView(
    entityType: string,
    entityId: number,
    context: TenantContext,
  ) {
    return this.logAction(
      {
        actionType: 'VIEW',
        entityType,
        entityId,
      },
      context,
    );
  }

  async logExport(
    entityType: string,
    filters: Record<string, any>,
    recordCount: number,
    context: TenantContext,
  ) {
    return this.logAction(
      {
        actionType: 'EXPORT',
        entityType,
        newValues: { filters, recordCount },
      },
      context,
    );
  }
}

