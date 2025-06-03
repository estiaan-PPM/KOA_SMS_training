// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles are allowed to access a route
 * @param roles - Array of role names that can access the route
 * @example @Roles('Admin', 'Teacher')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);