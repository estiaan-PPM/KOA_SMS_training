// src/audit/decorators/audit.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'auditAction';
export const AUDIT_ENTITY_KEY = 'auditEntity';

export interface AuditMetadata {
  action: string;
  entity: string;
  description?: string;
}

export const Audit = (metadata: AuditMetadata) => 
  SetMetadata(AUDIT_ACTION_KEY, metadata);

// Usage examples:
// @Audit({ action: 'CREATE', entity: 'Student', description: 'Student created' })
// @Audit({ action: 'UPDATE', entity: 'Student', description: 'Student updated' })
// @Audit({ action: 'DELETE', entity: 'Student', description: 'Student deleted' })

