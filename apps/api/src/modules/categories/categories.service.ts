import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    private slugify(text: string) {
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/([^0-9a-z-\s])/g, '')
            .replace(/(\s+)/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    async create(createCategoryDto: CreateCategoryDto) {
        const existing = await this.prisma.campaignCategory.findUnique({
            where: { name: createCategoryDto.name },
        });

        if (existing) {
            throw new ConflictException('Category name already exists');
        }

        return this.prisma.campaignCategory.create({
            data: {
                ...createCategoryDto,
                slug: this.slugify(createCategoryDto.name),
            },
        });
    }

    async findAll() {
        return this.prisma.campaignCategory.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { campaigns: true },
                },
            },
        });
    }

    async findOne(id: string) {
        const category = await this.prisma.campaignCategory.findUnique({
            where: { id },
        });

        if (!category) {
            throw new NotFoundException(`Category with ID "${id}" not found`);
        }

        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto) {
        await this.findOne(id);

        if (updateCategoryDto.name) {
            const existing = await this.prisma.campaignCategory.findUnique({
                where: { name: updateCategoryDto.name },
            });

            if (existing && existing.id !== id) {
                throw new ConflictException('Category name already exists');
            }
        }

        return this.prisma.campaignCategory.update({
            where: { id },
            data: {
                ...updateCategoryDto,
                ...(updateCategoryDto.name ? { slug: this.slugify(updateCategoryDto.name) } : {}),
            },
        });
    }

    async remove(id: string) {
        const category = await this.prisma.campaignCategory.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { campaigns: true },
                },
            },
        });

        if (!category) {
            throw new NotFoundException(`Category with ID "${id}" not found`);
        }

        if (category._count.campaigns > 0) {
            throw new ConflictException('Cannot delete category with associated campaigns');
        }

        return this.prisma.campaignCategory.delete({
            where: { id },
        });
    }
}
