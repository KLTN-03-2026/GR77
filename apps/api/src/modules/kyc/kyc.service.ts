import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KycStatus } from '@prisma/client';
import { SumsubService } from './sumsub.service';

@Injectable()
export class KycService {
  private readonly logger = new Logger('KycService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly sumsubService: SumsubService,
  ) {}

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
      const redirectUrl =
        provider === 'sumsub'
          ? `https://id.sumsub.com/idensic/l/${existingSession.externalRef}`
          : `https://mock-kyc-provider.example/verify/${existingSession.externalRef}`;

      return {
        sessionId: existingSession.id,
        provider: existingSession.provider,
        status: existingSession.status,
        redirectUrl,
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

    let externalRef: string;
    let redirectUrl: string;

    // 3) Gọi provider để get redirect URL
    if (provider === 'sumsub') {
      try {
        const { applicantId, redirectUrl: sumsubUrl } =
          await this.sumsubService.createApplicant(userId);
        externalRef = applicantId;
        redirectUrl = sumsubUrl;
        this.logger.log(`Sumsub applicant created: ${applicantId}`);
      } catch (error) {
        this.logger.error(`Failed to create Sumsub session: ${error.message}`);
        throw error;
      }
    } else {
      // Mock provider
      externalRef = `mock_${session.id}_${Date.now()}`;
      redirectUrl = `https://mock-kyc-provider.example/verify/${externalRef}`;
    }

    // 4) Update session với provider reference
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
   * Webhook callback từ provider KYC
   * Hỗ trợ: mock, sumsub
   */
  async applyWebhook(provider: string, payload: any) {
    let externalRef: string;
    let newStatus: KycStatus;
    let extractedData: any = {};

    if (provider === 'sumsub') {
      // Parse Sumsub webhook
      const sumsubData = this.sumsubService.parseWebhook(payload);
      externalRef = sumsubData.applicantId;

      const statusMap: Record<string, KycStatus> = {
        APPROVED: KycStatus.APPROVED,
        REJECTED: KycStatus.REJECTED,
        REVIEW: KycStatus.MANUAL_REVIEW,
      };

      newStatus = statusMap[sumsubData.status] ?? KycStatus.MANUAL_REVIEW;
      extractedData = {
        fullName: [sumsubData.firstName, sumsubData.lastName]
          .filter(Boolean)
          .join(' '),
        dob: sumsubData.dob,
        reason: sumsubData.reasons?.[0],
      };

      this.logger.log(
        `Sumsub webhook received for applicant: ${externalRef}, status: ${newStatus}`,
      );
    } else {
      // Mock provider
      externalRef = payload?.externalRef;
      if (!externalRef) {
        throw new NotFoundException('Missing externalRef in webhook payload');
      }

      const statusMap: Record<string, KycStatus> = {
        APPROVED: KycStatus.APPROVED,
        REJECTED: KycStatus.REJECTED,
        REVIEW: KycStatus.MANUAL_REVIEW,
      };

      newStatus = statusMap[payload.decision] ?? KycStatus.MANUAL_REVIEW;
      extractedData = {
        fullName: payload.fullName,
        dob: payload.dob,
        reason: payload.reason,
      };
    }

    // Find session by externalRef, then update
    let session;
    try {
      const kycSession = await this.prisma.kycSession.findFirst({
        where: { externalRef },
        select: { id: true, userId: true },
      });

      if (!kycSession) {
        this.logger.warn(`KYC session not found: ${externalRef}`);
        throw new NotFoundException('KYC session not found');
      }

      session = await this.prisma.kycSession.update({
        where: { id: kycSession.id },
        data: {
          status: newStatus,
          reviewResult: newStatus,
          rejectReason: extractedData.reason ?? null,
          extractedFullName: extractedData.fullName ?? null,
          extractedDob: extractedData.dob ? new Date(extractedData.dob) : null,
        },
        select: { userId: true, status: true },
      });
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`KYC update error: ${error.message}`);
      throw error;
    }

    // Update user KYC status
    await this.prisma.user.update({
      where: { id: session.userId },
      data: { kycStatus: session.status },
    });

    this.logger.log(
      `KYC session updated: ${externalRef}, new status: ${newStatus}`,
    );

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
