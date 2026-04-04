import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private from: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('RESEND_API_KEY');
    this.resend = new Resend(apiKey || 're_default_key');
    // If domain is not verified, Resend requires using their default onboarding email
    this.from = this.configService.get('MAIL_FROM') || 'onboarding@resend.dev';
  }

  async sendVerificationEmail(email: string, code: string) {
    const webUrl = this.configService.get('WEB_URL') || 'http://localhost:3000';
    await this.resend.emails.send({
      from: `Kindlink <${this.from}>`,
      to: email,
      subject: 'Verify your Kindlink account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #7598C1;">Welcome to Kindlink!</h2>
          <p>Thank you for joining our community. To complete your registration, please enter the following verification code:</p>
          <div style="background: #f4f4f4; padding: 20px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 10px; color: #333; margin: 20px 0;">
            ${code}
          </div>
          <p>Alternatively, click the link below to verify automatically:</p>
          <p><a href="${webUrl}/verify-email?email=${encodeURIComponent(email)}&code=${code}" style="color: #5DA2D5;">[Verify Account Link]</a></p>
          <hr />
          <p style="font-size: 12px; color: #888;">This code will expire in 1 hour. If you did not sign up for this account, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, code: string) {
    await this.resend.emails.send({
      from: `Kindlink Security <${this.from}>`,
      to: email,
      subject: 'Password Reset Code - Kindlink',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #7598C1;">Password Reset Request</h2>
          <p>We received a request to reset your Kindlink account password. Enter the following code to proceed:</p>
          <div style="background: #f4f4f4; padding: 20px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 10px; color: #333; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in <strong>5 minutes</strong>.</p>
          <p style="color: #E56C6C;">If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
          <hr />
          <p style="font-size: 12px; color: #888;">Kindlink Security Team</p>
        </div>
      `,
    });
  }

  async sendAccountLockEmail(email: string, reason: string) {
    await this.resend.emails.send({
      from: `Kindlink Security <${this.from}>`,
      to: email,
      subject: 'Account Restricted - Kindlink Security',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #E56C6C;">Account Restricted</h2>
          <p>This is an automated security notification regarding your Kindlink account.</p>
          <p>Your account has been <strong>restricted</strong> by our administrative team for the following reason:</p>
          <div style="background: #FFF5F5; border-left: 4px solid #E56C6C; padding: 15px; margin: 20px 0; font-style: italic; color: #C53030;">
            "${reason}"
          </div>
          <p>While your account is restricted, you will not be able to log in or perform any actions on the platform.</p>
          <p>If you believe this is a mistake or would like to appeal this decision, please contact our support team at <a href="mailto:support@kindlink.com" style="color: #7598C1;">support@kindlink.com</a>.</p>
          <hr />
          <p style="font-size: 12px; color: #888;">Kindlink Security Enforcement Division</p>
        </div>
      `,
    });
  }

  async sendAccountUnlockEmail(email: string) {
    await this.resend.emails.send({
      from: `Kindlink Security <${this.from}>`,
      to: email,
      subject: 'Account Restored - Kindlink Security',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #7BC712;">Account Restored</h2>
          <p>Good news! Your Kindlink account has been fully restored.</p>
          <p>You can giờ đây có thể đăng nhập vào và tiếp tục sử dụng tất cả các tính năng của nền tảng như bình thường.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get('WEB_URL') || 'http://localhost:3000'}/login" style="background: #7598C1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Kindlink</a>
          </div>
          <hr />
          <p style="font-size: 12px; color: #888;">Thank you for being part of our community.<br/>Kindlink Team</p>
        </div>
      `,
    });
  }

  async sendCampaignApprovalRequestToAdmin(campaignTitle: string, creatorName: string, campaignId: string) {
    const adminEmail = this.configService.get('ADMIN_NOTIFICATION_EMAIL') || 'admin@kindlink.com';
    const webUrl = this.configService.get('WEB_URL') || 'http://localhost:3000';

    await this.resend.emails.send({
      from: `Kindlink System <${this.from}>`,
      to: adminEmail,
      subject: 'New Campaign Pending Approval - Kindlink',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #7598C1;">New Campaign Submission</h2>
          <p>A new campaign has been created and is waiting for your review.</p>
          <div style="background: #F8F9FA; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Title:</strong> ${campaignTitle}</p>
            <p><strong>Creator:</strong> ${creatorName}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${webUrl}/admin/campaigns?id=${campaignId}" style="background: #7598C1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Campaign</a>
          </div>
          <hr />
          <p style="font-size: 12px; color: #888;">Kindlink Automated Review System</p>
        </div>
      `,
    });
  }

  async sendCampaignStatusUpdateToUser(email: string, campaignTitle: string, status: 'ACTIVE' | 'REJECTED', note?: string) {
    const isApproved = status === 'ACTIVE';
    const webUrl = this.configService.get('WEB_URL') || 'http://localhost:3000';

    await this.resend.emails.send({
      from: `Kindlink Community <${this.from}>`,
      to: email,
      subject: isApproved ? 'Campaign Approved!' : 'Updates regarding your campaign submission',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: ${isApproved ? '#7BC712' : '#E56C6C'};">${isApproved ? 'Congratulations!' : 'Campaign Status Update'}</h2>
          <p>Your campaign <strong>"${campaignTitle}"</strong> has been ${isApproved ? 'approved and is now LIVE' : 'reviewed by our moderation team'}.</p>
          
          ${!isApproved && note ? `
          <div style="background: #FFF5F5; border-left: 4px solid #E56C6C; padding: 15px; margin: 20px 0; color: #C53030;">
            <p style="font-weight: bold; margin-top: 0;">Moderator Feedback:</p>
            <p style="font-style: italic;">"${note}"</p>
          </div>
          <p>You may update your campaign details and resubmit for review.</p>
          ` : ''}

          ${isApproved ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${webUrl}/home" style="background: #7BC712; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Your Campaign</a>
          </div>
          ` : ''}

          <hr />
          <p style="font-size: 12px; color: #888;">Kindlink Community Team</p>
        </div>
      `,
    });
  }

  async sendEmailChangeVerification(newEmail: string, code: string) {
    await this.resend.emails.send({
      from: `Kindlink Security <${this.from}>`,
      to: newEmail,
      subject: 'Verify Your New Email - Kindlink',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #7598C1;">Email Change Verification</h2>
          <p>You have requested to change your email address to this email. Please enter the following verification code to confirm:</p>
          <div style="background: #f4f4f4; padding: 20px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 10px; color: #333; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in <strong>5 minutes</strong>.</p>
          <p style="color: #E56C6C;">If you did not request this change, please ignore this email.</p>
          <hr />
          <p style="font-size: 12px; color: #888;">Kindlink Security Team</p>
        </div>
      `,
    });
  }

  async sendSecurityAlertEmail(oldEmail: string, newEmail: string, actionToken: string) {
    const revertUrl = `${this.configService.get('WEB_URL') || 'http://localhost:3000'}/revert-email?token=${actionToken}`;
    await this.resend.emails.send({
      from: `Kindlink Security <${this.from}>`,
      to: oldEmail,
      subject: 'Security Alert: Email Change Requested',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #E56C6C;">Security Alert</h2>
          <p>We received a request to change the email address associated with your Kindlink account to <strong>${newEmail}</strong>.</p>
          <p>If you made this request, you do not need to do anything with this email. Please check your new email for the verification code to complete the process.</p>
          <div style="background: #FFF5F5; border-left: 4px solid #E56C6C; padding: 15px; margin: 20px 0; color: #C53030;">
            <p style="font-weight: bold; margin-top: 0;">Did you not request this change?</p>
            <p>If you did not request this email change, please secure your account immediately and cancel this request.</p>
            <a href="${revertUrl}" style="display: inline-block; background-color: #E56C6C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; font-weight: bold;">Không phải tôi, dừng thay đổi</a>
          </div>
          <hr />
          <p style="font-size: 12px; color: #888;">Kindlink Security Team</p>
        </div>
      `,
    });
  }
}
