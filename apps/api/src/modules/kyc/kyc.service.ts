import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KycStatus } from '@prisma/client';

@Injectable()
export class KycService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo KYC session mới
   */
  async createSession(userId: string, provider = 'mock') {
    // 1) Kiểm tra user có session active chưa
    const existingSession = await this.prisma.kycSession.findFirst({
      where: {
        userId,
        status: { in: [KycStatus.PENDING_SUBMISSION, KycStatus.PROCESSING] },
      },
    });

    if (existingSession) {
      return {
        sessionId: existingSession.id,
        provider: existingSession.provider,
        status: existingSession.status,
        redirectUrl: `https://mock-kyc-provider.example/verify/${existingSession.externalRef}`,
      };
    }

    // 2) Tạo session DB
    const session = await this.prisma.kycSession.create({
      data: {
        userId,
        provider,
        status: KycStatus.PENDING_SUBMISSION,
      },
      select: { id: true, provider: true, status: true },
    });

    // 3) Mock: tạo externalRef (thực tế sẽ là applicantId từ provider)
    const externalRef = `mock_${session.id}_${Date.now()}`;
    const redirectUrl = `https://mock-kyc-provider.example/verify/${externalRef}`;

    // 4) Update session
    await this.prisma.kycSession.update({
      where: { id: session.id },
      data: {
        externalRef,
        status: KycStatus.PROCESSING,
      },
    });

    return {
      sessionId: session.id,
      provider,
      redirectUrl,
      message: 'KYC session created. Redirect user to verify documents.',
    };
  }

  /**
   * Lấy latest KYC session của user
   */
  async latest(userId: string) {
    const latest = await this.prisma.kycSession.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        provider: true,
        status: true,
        reviewResult: true,
        rejectReason: true,
        extractedFullName: true,
        extractedDob: true,
        extractedDocNo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return (
      latest ?? {
        status: KycStatus.NOT_STARTED,
        message: 'No KYC session found',
      }
    );
  }

  /**
   * Webhook callback từ provider KYC (Mock)
   * Thực tế sẽ verify signature từ provider
   */
  async applyWebhook(provider: string, payload: any) {
    const externalRef = payload?.externalRef;
    if (!externalRef) {
      throw new NotFoundException('Missing externalRef in webhook payload');
    }

    // Mapping decision → KycStatus
    const statusMap: Record<string, KycStatus> = {
      APPROVED: KycStatus.APPROVED,
      REJECTED: KycStatus.REJECTED,
      REVIEW: KycStatus.MANUAL_REVIEW,
    };

    const newStatus = statusMap[payload.decision] ?? KycStatus.MANUAL_REVIEW;

    // Update session
    const session = await this.prisma.kycSession.update(
      {
        where: { externalRef },
        data: {
          status: newStatus,
          reviewResult: payload.decision,
          rejectReason: payload.reason ?? null,
          extractedFullName: payload.fullName ?? null,
          extractedDob: payload.dob ? new Date(payload.dob) : null,
          extractedDocNo: payload.docNo ?? null,
        },
        select: { userId: true, status: true },
      },
      (error) => {
        if (error.code === 'P2025') {
          throw new NotFoundException('KYC session not found');
        }
        throw error;
      },
    );

    // Update user KYC status
    await this.prisma.user.update({
      where: { id: session.userId },
      data: { kycStatus: session.status },
    });

    return {
      ok: true,
      sessionId: session.userId,
      newStatus: session.status,
    };
  }

  /**
   * Thêm document vào session (sau này khi integrate upload)
   */
  async addDocument(
    userId: string,
    sessionId: string,
    type: string,
    fileUrl: string,
  ) {
    // Verify session belongs thực user
    const session = await this.prisma.kycSession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('KYC session not found');
    }

    const doc = await this.prisma.kycDocument.create({
      data: {
        kycSessionId: sessionId,
        type,
        fileUrl,
      },
      select: { id: true, type: true, fileUrl: true, createdAt: true },
    });

    return doc;
  }
}
