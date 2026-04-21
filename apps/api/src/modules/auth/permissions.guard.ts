import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { AdminPermission } from '../../constants/permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<AdminPermission[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        // Super Admin có tất cả các quyền
        if (user?.role === Role.SUPER_ADMIN) {
            return true;
        }

        // Nếu không phải Admin thì không có quyền của Admin
        if (user?.role !== Role.ADMIN) {
            return false;
        }

        const userPermissions: string[] = user?.permissions || [];

        // Kiểm tra xem user có ít nhất một trong các quyền yêu cầu không (OR logic)
        // Hoặc có thể dùng AND logic tùy yêu cầu, nhưng thông thường route chỉ yêu cầu 1 quyền chính.
        const hasPermission = requiredPermissions.some((permission) =>
            userPermissions.includes(permission),
        );

        if (!hasPermission) {
            throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
        }

        return true;
    }
}
