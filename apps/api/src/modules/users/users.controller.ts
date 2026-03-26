import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
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
    async findAll(@Request() req: any) {
        const { sub, role } = req.user;
        return this.usersService.findAll(sub, role);
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
        return this.usersService.upgradeToAdmin(id, req.user.sub);
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
     * POST /users/me/accept-policy
     * Allows user to accept/update policy.
     * Anyone can accept policy for themselves (JWT required).
     */
    @Post('me/accept-policy')
    @MinRole(Role.USER) // Any user can do this
    async acceptPolicy(@Request() req: any) {
        const userId = req.user.sub;
        return this.usersService.acceptPolicy(userId);
    }

    /**
     * GET /users/me/policy-status
     * Check if user needs to accept updated policy.
     */
    @Get('me/policy-status')
    @MinRole(Role.USER)
    async checkPolicyStatus(@Request() req: any) {
        const userId = req.user.sub;
        const needsUpdate = await this.usersService.needsPolicyUpdate(userId);
        return {
            needsPolicyUpdate: needsUpdate,
            message: needsUpdate ? 'Please accept the updated policy' : 'Policy is up to date',
        };
    }
}
