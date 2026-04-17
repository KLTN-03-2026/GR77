import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OcrService } from './services/ocr.service';
import { NotificationsService } from '../notifications/notifications.service';
import { VerifyEkycDto } from './dto/verify-ekyc.dto';
import { EkycStatus } from '@prisma/client';

@Injectable()
export class EkycService {
    constructor(
        private prisma: PrismaService,
        private ocrService: OcrService,
        private notificationsService: NotificationsService,
    ) { }

    async getStatus(userId: string) {
        const ekyc = await this.prisma.userEkyc.findUnique({
            where: { userId },
        });

        if (!ekyc) {
            return { status: 'NOT_STARTED' };
        }

        return ekyc;
    }

    async submitVerification(userId: string, dto: VerifyEkycDto) {
        // 1. Check if user already has a pending or approved ekyc
        const existing = await this.prisma.userEkyc.findUnique({
            where: { userId },
        });

        if (existing && (existing.status === EkycStatus.PENDING || existing.status === EkycStatus.APPROVED)) {
            throw new BadRequestException(`Xác minh đang được xử lý hoặc đã hoàn tất (Trạng thái: ${existing.status})`);
        }

        // 2. Process with OCR (Mock or FPT AI)
        const ocrData = await this.ocrService.processIdCard(dto.frontImageUrl, dto.backImageUrl);

        // 3. Prevent duplicate CCCD (Check if another user already used this CCCD)
        if (ocrData.idNumber && ocrData.idNumber !== 'N/A') {
            const duplicateEkyc = await this.prisma.userEkyc.findFirst({
                where: {
                    idNumber: ocrData.idNumber,
                    userId: { not: userId }, // Different user
                    status: { in: [EkycStatus.PENDING, EkycStatus.APPROVED] },
                },
            });

            if (duplicateEkyc) {
                throw new BadRequestException('Căn cước công dân này đã được liên kết với một tài khoản khác trong hệ thống.');
            }
        }

        // 4. Save to DB
        const ekyc = await this.prisma.userEkyc.upsert({
            where: { userId },
            update: {
                status: EkycStatus.PENDING,
                idNumber: ocrData.idNumber,
                fullName: ocrData.fullName,
                dob: ocrData.dob,
                gender: ocrData.gender,
                address: ocrData.address,
                frontImageUrl: dto.frontImageUrl,
                backImageUrl: dto.backImageUrl,
                selfieImageUrl: dto.selfieImageUrl,
                rejectionReason: null,
            },
            create: {
                userId,
                status: EkycStatus.PENDING,
                idNumber: ocrData.idNumber,
                fullName: ocrData.fullName,
                dob: ocrData.dob,
                gender: ocrData.gender,
                address: ocrData.address,
                frontImageUrl: dto.frontImageUrl,
                backImageUrl: dto.backImageUrl,
                selfieImageUrl: dto.selfieImageUrl,
            },
        });

        return {
            message: 'Yêu cầu xác minh đã được gửi thành công. Đang chờ hệ thống phê duyệt.',
            data: ekyc,
        };
    }

    /**
     * Basic validation for Vietnamese CCCD (12 digits)
     */
    private isValidCccd(id: string): boolean {
        const regex = /^[0-9]{12}$/;
        return regex.test(id);
    }

    // Admin functions
    async getAll(status?: string) {
        const where: any = {};

        if (status && status !== 'All') {
            const upperStatus = status.toUpperCase();
            if (['PENDING', 'APPROVED', 'REJECTED'].includes(upperStatus)) {
                where.status = upperStatus as EkycStatus;
            }
        }

        return this.prisma.userEkyc.findMany({
            where,
            include: { user: { select: { email: true, username: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async approve(userId: string) {
        const result = await this.prisma.$transaction(async (tx) => {
            const ekyc = await tx.userEkyc.update({
                where: { userId },
                data: { status: EkycStatus.APPROVED },
            });

            // Also update the User record so campaign creation check passes
            await tx.user.update({
                where: { id: userId },
                data: { isKycVerified: true },
            });

            return ekyc;
        });

        // Send system notification
        await this.notificationsService.create({
            userId,
            title: 'Xác minh danh tính thành công',
            message: 'Hồ sơ KYC của bạn đã được quản trị viên phê duyệt. Bây giờ bạn có thể trải nghiệm đầy đủ các tính năng trên hệ thống.',
            type: 'INFO',
            link: '/profile'
        });

        return result;
    }

    async reject(userId: string, reason: string) {
        const result = await this.prisma.$transaction(async (tx) => {
            const ekyc = await tx.userEkyc.update({
                where: { userId },
                data: {
                    status: EkycStatus.REJECTED,
                    rejectionReason: reason
                },
            });

            // Also reset the User record
            await tx.user.update({
                where: { id: userId },
                data: { isKycVerified: false },
            });

            return ekyc;
        });

        // Send system notification
        await this.notificationsService.create({
            userId,
            title: 'Xác minh danh tính bị từ chối',
            message: `Hồ sơ KYC của bạn đã bị từ chối với lý do: "${reason}". Vui lòng cập nhật lại thông tin.`,
            type: 'WARNING',
            link: '/profile/ekyc'
        });

        return result;
    }
}
