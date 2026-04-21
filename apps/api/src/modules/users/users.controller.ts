import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
    Query,
    ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { MinRole } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@MinRole(Role.ADMIN) // Tất cả các route trong controller này yêu cầu ít nhất ADMIN
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * GET /users
     * - ADMIN     → trả về USER + ORGANIZER (không có ADMIN/SUPER_ADMIN)
     * - SUPER_ADMIN → trả về tất cả trừ chính mình
     */
    @Get()
    async findAll(@Request() req: any, @Query('roleGroup') roleGroup?: 'ADMINS' | 'MEMBERS') {
        const { sub, role } = req.user;
        return this.usersService.findAll(sub, role, roleGroup);
    }

    /**
     * GET /users/:id
     * ADMIN chỉ được xem USER/ORGANIZER → kiểm tra trong service khi cần
     */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    /**
     * POST /users
     * - ADMIN        → tạo USER/ORGANIZER; không được tạo ADMIN/SUPER_ADMIN
     * - SUPER_ADMIN  → tạo bất kỳ role nào
     */
    @Post()
    async create(@Request() req: any, @Body() body: any) {
        const { sub, role } = req.user;
        return this.usersService.create(body, role);
    }

    /**
     * POST /users/:id/upgrade-role
     * Chỉ SUPER_ADMIN được phép nâng role lên ADMIN.
     */
    @Post(':id/upgrade-role')
    @MinRole(Role.SUPER_ADMIN)
    async upgradeToAdmin(@Param('id') id: string, @Request() req: any) {
        return this.usersService.upgradeToAdmin(id, req.user.sub, req.user.role);
    }

    /**
     * POST /users/:id/lock
     * ADMIN: khoá USER/ORGANIZER    SUPER_ADMIN: khoá ADMIN (không khoá SUPER_ADMIN khác)
     */
    @Post(':id/lock')
    async lock(
        @Param('id') id: string,
        @Body('reason') reason: string,
        @Request() req: any,
    ) {
        const { sub, role } = req.user;
        return this.usersService.lock(id, reason, sub, role);
    }

    /**
     * POST /users/:id/unlock
     */
    @Post(':id/unlock')
    async unlock(@Param('id') id: string, @Request() req: any) {
        const { sub, role } = req.user;
        return this.usersService.unlock(id, sub, role);
    }

    /**
     * PATCH /users/:id/permissions
     * Chỉ SUPER_ADMIN được phép phân quyền.
     */
    @Post(':id/permissions')
    @MinRole(Role.SUPER_ADMIN)
    async updatePermissions(
        @Param('id') id: string,
        @Body('permissions') permissions: string[],
        @Request() req: any,
    ) {
        const { sub, role } = req.user;
        return this.usersService.updatePermissions(id, permissions, sub, role);
    }
}
