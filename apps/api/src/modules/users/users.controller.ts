import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Post()
    async create(@Body() body: any) {
        return this.usersService.create(body);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.usersService.update(id, body);
    }

    @Post(':id/lock')
    async lock(@Param('id') id: string, @Body('reason') reason: string) {
        return this.usersService.lock(id, reason);
    }

    @Post(':id/unlock')
    async unlock(@Param('id') id: string) {
        return this.usersService.unlock(id);
    }
}
