import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Role hierarchy: SUPER_ADMIN > ADMIN > ORGANIZER > USER
 * GetMinRole: require at minimum this role level (and above).
 * Example: @MinRole(Role.ADMIN) allows ADMIN + SUPER_ADMIN
 */
export const MIN_ROLE_KEY = 'minRole';
export const MinRole = (role: Role) => SetMetadata(MIN_ROLE_KEY, role);
