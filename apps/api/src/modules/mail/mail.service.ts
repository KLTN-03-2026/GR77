import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const user = this.configService.get('MAIL_USER');
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    const refreshToken = this.configService.get('GOOGLE_REFRESH_TOKEN');

    if (user && clientId && clientSecret && refreshToken) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: user,
          clientId: clientId,
          clientSecret: clientSecret,
          refreshToken: refreshToken,
        },
      });
      this.logger.log('Gmail OAuth2 transport initialized');
    } else {
      this.logger.warn('Mail configuration is missing. Emails will not be sent.');
    }
  }

  async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.error('Mail transporter not initialized');
      return false;
    }

    try {
      const from = this.configService.get('MAIL_FROM') || this.configService.get('MAIL_USER');
      await this.transporter.sendMail({
        from: `"Kindlink Team" <${from}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error.message);
      return false;
    }
  }

  async sendVerificationEmail(email: string, code: string): Promise<boolean> {
    const subject = 'Xác thực tài khoản Kindlink';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">Chào mừng bạn đến với Kindlink!</h2>
        <p>Cảm ơn bạn đã đăng ký. Vui lòng sử dụng mã xác thực dưới đây để hoàn tất quy trình:</p>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #333; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>Mã này sẽ hết hạn sau 15 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">© 2026 Kindlink. All rights reserved.</p>
      </div>
    `;
    return this.sendMail(email, subject, html);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const webUrl = this.configService.get('WEB_URL') || 'https://kindlink-web.vercel.app';
    const resetUrl = `${webUrl}/reset-password?token=${token}`;

    const subject = 'Khôi phục mật khẩu Kindlink';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">Khôi phục mật khẩu</h2>
        <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản Kindlink của bạn.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px;">Đặt lại mật khẩu</a>
        </div>
        <p>Hoặc copy link sau dán vào trình duyệt:</p>
        <p style="font-size: 13px; color: #666; word-break: break-all;">${resetUrl}</p>
        <p>Lưu ý: Link này chỉ có hiệu lực trong 60 phút.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">© 2026 Kindlink. All rights reserved.</p>
      </div>
    `;
    return this.sendMail(email, subject, html);
  }
}
