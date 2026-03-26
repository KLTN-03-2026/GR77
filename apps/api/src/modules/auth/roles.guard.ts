import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY, MIN_ROLE_KEY } from './roles.decorator';

/** Thứ tự ưu tiên role: số càng cao quyền càng lớn */
const ROLE_HIERARCHY: Record<Role, number> = {
    [Role.USER]: 0,
    [Role.ORGANIZER]: 1,
    [Role.ADMIN]: 2,
    [Role.SUPER_ADMIN]: 3,
};

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const { user } = context.switchToHttp().getRequest();

        // --- Kiểm tra @Roles(...) (exact match, OR logic) ---
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (requiredRoles?.length) {
            return requiredRoles.some((role) => user?.role === role);
        }

        // --- Kiểm tra @MinRole(role) (hierarchy) ---
        const minRole = this.reflector.getAllAndOverride<Role>(MIN_ROLE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (minRole) {
            const userLevel = ROLE_HIERARCHY[user?.role as Role] ?? -1;
            const requiredLevel = ROLE_HIERARCHY[minRole] ?? 99;
            return userLevel >= requiredLevel;
        }

        return true;
    }
}
