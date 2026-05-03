import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { MinRole } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { AdminPermission } from '../../constants/permissions';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {
        console.log('CategoriesController initialized');
    }


    @Get()
    findAll() {
        return this.categoriesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @MinRole(Role.ADMIN)
    @RequirePermissions(AdminPermission.CATEGORIES_MANAGE)
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @MinRole(Role.ADMIN)
    @RequirePermissions(AdminPermission.CATEGORIES_MANAGE)
    update(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @MinRole(Role.ADMIN)
    @RequirePermissions(AdminPermission.CATEGORIES_MANAGE)
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(id);
    }
}
