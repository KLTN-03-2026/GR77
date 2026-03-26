import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import axios, { AxiosInstance } from 'axios';

/**
 * Sumsub KYC Service
 *
 * Integrate với Sumsub API để verify documents
 * Docs: https://docs.sumsub.com/
 *
 * Environment variables cần có:
 * - SUMSUB_API_KEY: API key từ Sumsub
 * - SUMSUB_SECRET_KEY: Secret key để sign requests + verify webhooks
 * - SUMSUB_API_URL: https://api.sumsub.com (or sandbox)
 */
@Injectable()
export class SumsubService {
  private readonly logger = new Logger('SumsubService');
  private readonly apiKey = process.env.SUMSUB_API_KEY;
  private readonly secretKey = process.env.SUMSUB_SECRET_KEY || '';
  private readonly apiUrl = process.env.SUMSUB_API_URL || 'https://api.sumsub.com';
  private readonly client: AxiosInstance;

  constructor() {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Missing SUMSUB_API_KEY or SUMSUB_SECRET_KEY environment variables');
    }

    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 10000,
    });

    // Add request interceptor để sign requests
    this.client.interceptors.request.use((config) => {
      return this.signRequest(config);
    });
  }

  /**
   * Tạo applicant mới trên Sumsub
   * Return: applicantId, redirectUrl
   */
  async createApplicant(userId: string): Promise<{
    applicantId: string;
    redirectUrl: string;
  }> {
    try {
      const response = await this.client.post('/resources/applicants', {
        externalUserId: userId, // Link với user ID của bạn
      });

      const { id: applicantId } = response.data;

      // Get SDK token để user verify documents
      const tokenResponse = await this.client.post(
        `/resources/applicants/${applicantId}/sdkIntegrationToken`,
        { ttlInSecs: 600 }, // Token valid 10 minutes
      );

      const { token } = tokenResponse.data;

      // Redirect URL để user verify
      const redirectUrl = `${this.apiUrl}/integration/screens/individual/${token}`;

      this.logger.log(`Created Sumsub applicant: ${applicantId} for user: ${userId}`);

      return {
        applicantId,
        redirectUrl,
      };
    } catch (error) {
      this.logger.error(`Failed to create Sumsub applicant: ${error.message}`);
      throw new BadRequestException('Failed to create KYC session with Sumsub');
    }
  }

  /**
   * Get applicant status từ Sumsub
   */
  async getApplicantStatus(applicantId: string): Promise<{
    status: string;
    reviewStatus?: string;
    decisionTime?: string;
    reasons?: string[];
  }> {
    try {
      const response = await this.client.get(`/resources/applicants/${applicantId}/status`);

      return {
        status: response.data.applicantStatus,
        reviewStatus: response.data.reviewStatus,
        decisionTime: response.data.decisionTime,
        reasons: response.data.reasons,
      };
    } catch (error) {
      this.logger.error(`Failed to get Sumsub applicant status: ${error.message}`);
      throw new BadRequestException('Failed to get KYC status');
    }
  }

  /**
   * 🔒 Verify webhook signature từ Sumsub
   *
   * Sumsub gửi X-Signature header = HMAC-SHA256(body + secret)
   */
  verifyWebhookSignature(payload: any, signature: string): boolean {
    try {
      const body = JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(body)
        .digest('hex');

      const isValid = expectedSignature === signature;

      if (!isValid) {
        this.logger.warn('Invalid Sumsub webhook signature');
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Parse Sumsub webhook payload
   */
  parseWebhook(payload: any): {
    applicantId: string;
    status: 'APPROVED' | 'REJECTED' | 'REVIEW' | string;
    reviewStatus?: string;
    reasons?: string[];
    firstName?: string;
    lastName?: string;
    dob?: string;
    country?: string;
  } {
    return {
      applicantId: payload.applicantId,
      status: this.mapSumsubStatus(payload.applicantStatus),
      reviewStatus: payload.reviewStatus,
      reasons: payload.reasons || [],
      firstName: payload.applicantData?.firstName,
      lastName: payload.applicantData?.lastName,
      dob: payload.applicantData?.dob,
      country: payload.applicantData?.country,
    };
  }

  /**
   * Map Sumsub status ra KYC status
   */
  private mapSumsubStatus(sumsubStatus: string): string {
    const statusMap: Record<string, string> = {
      SUBMITTED: 'REVIEW',
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED',
      PENDING: 'REVIEW',
      RESUBMISSION_REQUESTED: 'REVIEW',
    };

    return statusMap[sumsubStatus] || 'REVIEW';
  }

  /**
   * Sign request như yêu cầu của Sumsub API
   *
   * Signature = HMAC-SHA256(method + path + body + timestamp + secretKey)
   */
  private signRequest(config: any): any {
    const method = config.method?.toUpperCase() || 'GET';
    const path = config.url || '';
    const body = config.data ? JSON.stringify(config.data) : '';
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Build signature string
    const signatureRawData = `${method}${path}${body}${timestamp}`;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(signatureRawData)
      .digest('hex');

    // Add headers
    config.headers = {
      ...config.headers,
      'X-App-Access-Ts': timestamp,
      'X-App-Access-Sig': signature,
      'X-App-Token': this.apiKey,
    };

    return config;
  }
}
