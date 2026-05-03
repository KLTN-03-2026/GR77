import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class MailService {
  private gmail: any;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const user = this.configService.get('MAIL_USER');
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    const refreshToken = this.configService.get('GOOGLE_REFRESH_TOKEN');

    if (user && clientId && clientSecret && refreshToken) {
      try {
        const oauth2Client = new google.auth.OAuth2(
          clientId,
          clientSecret,
          'https://developers.google.com/oauthplayground'
        );

        oauth2Client.setCredentials({
          refresh_token: refreshToken
        });

        this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        this.logger.log('Gmail REST API initialized successfully (Bypassing SMTP ports)');
      } catch (error) {
        this.logger.error('Failed to initialize Gmail API:', error.message);
      }
    } else {
      this.logger.warn('Mail configuration is missing. Emails will not be sent.');
    }
  }

  async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.gmail) {
      this.logger.error('Gmail service not initialized');
      return false;
    }

    try {
      const from = this.configService.get('MAIL_USER');

      // Gmail REST API requires the entire email to be base64url encoded
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `From: "Kindlink Team" <${from}>`,
        `To: ${to}`,
        `Content-Type: text/html; charset=utf-8`,
        `MIME-Version: 1.0`,
        `Subject: ${utf8Subject}`,
        '',
        html,
      ];
      const message = messageParts.join('\n');

      // The message needs to be base64url encoded
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      this.logger.log(`Email (API) sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email (API) to ${to}:`, error.message);
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

  async sendPasswordResetEmail(email: string, code: string): Promise<boolean> {
    const subject = 'Khôi phục mật khẩu Kindlink';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">Khôi phục mật khẩu</h2>
        <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản Kindlink của bạn. Vui lòng nhập mã có 6 chữ số dưới đây vào ứng dụng để tiếp tục:</p>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; color: #333; letter-spacing: 8px; border-radius: 5px; margin: 30px 0;">
          ${code}
        </div>
        <p>Lưu ý: Mã này chỉ có hiệu lực trong 60 phút.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">© 2026 Kindlink. All rights reserved.</p>
      </div>
    `;
    return this.sendMail(email, subject, html);
  }

  async sendEmailChangeVerification(newEmail: string, code: string): Promise<boolean> {
    const subject = 'Xác thực thay đổi Email - Kindlink';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Xác thực thay đổi Email</h2>
        <p>Bạn vừa yêu cầu thay đổi email sang địa chỉ này. Vui lòng nhập mã sau để xác nhận:</p>
        <div style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px; display: inline-block;">${code}</div>
        <p>Mã này có hiệu lực trong 5 phút.</p>
      </div>
    `;
    return this.sendMail(newEmail, subject, html);
  }

  async sendSecurityAlertEmail(email: string, newEmail: string, actionToken: string): Promise<boolean> {
    const webUrl = this.configService.get('WEB_URL') || 'https://kindlink-web.vercel.app';
    const revertUrl = `${webUrl}/security/revert-email?token=${actionToken}`;

    const subject = 'Cảnh báo bảo mật: Email tài khoản đã bị thay đổi';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #ff0000; border-radius: 10px;">
        <h2 style="color: #d32f2f;">Cảnh báo bảo mật!</h2>
        <p>Email tài khoản Kindlink của bạn vừa được thay đổi sang: <strong>${newEmail}</strong></p>
        <p>Nếu bạn KHÔNG thực hiện thay đổi này, hãy nhấn ngay vào nút bên dưới để hủy bỏ và khóa tài khoản bảo vệ thông tin:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${revertUrl}" style="background-color: #d32f2f; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px;">Hủy thay đổi & Khóa tài khoản</a>
        </div>
        <p style="color: #666; font-size: 12px;">Link này có hiệu lực trong 7 ngày. Nếu là bạn thực hiện, vui lòng bỏ qua mail này.</p>
      </div>
    `;
    return this.sendMail(email, subject, html);
  }

  async sendCampaignStatusUpdateToUser(email: string, campaignTitle: string, status: string, reason?: string): Promise<boolean> {
    const statusText = status === 'ACTIVE' ? 'đã được DUYỆT' : 'đã bị TỪ CHỐI';
    const color = status === 'ACTIVE' ? '#4CAF50' : '#d32f2f';

    const subject = `Thông báo trạng thái chiến dịch: ${campaignTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Cập nhật trạng thái chiến dịch</h2>
        <p>Chiến dịch <strong>"${campaignTitle}"</strong> của bạn ${statusText}.</p>
        ${status === 'ACTIVE'
        ? '<p>Chúc mừng! Chiến dịch của bạn hiện đã được hiển thị công khai để nhận quyên góp.</p>'
        : `<p style="color: #d32f2f;">Lý do từ chối: ${reason || 'Không cung cấp lý do cụ thể.'}</p>`}
        <p>Trân trọng,<br/>Kindlink Team</p>
      </div>
    `;
    return this.sendMail(email, subject, html);
  }

  async sendAccountInvitation(email: string, password: string, role: string): Promise<boolean> {
    const roleMap: Record<string, string> = {
      ADMIN: 'Quản trị viên',
      SUPER_ADMIN: 'Super Admin',
      USER: 'Thành viên',
    };

    const subject = 'Lời mời gia nhập hệ thống Kindlink';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #7598C1; border-radius: 10px;">
        <h2 style="color: #7598C1; text-align: center;">Chào mừng bạn đến với Kindlink!</h2>
        <p>Quản trị viên đã tạo cho bạn một tài khoản trên hệ thống với vai trò: <strong>${roleMap[role] || role}</strong>.</p>
        <p>Dưới đây là thông tin đăng nhập của bạn:</p>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #7598C1; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Mật khẩu:</strong> ${password}</p>
        </div>
        <p style="color: #d32f2f; font-weight: bold;">Lưu ý: Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu để đảm bảo an toàn.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${this.configService.get('WEB_URL') || 'http://localhost:3000'}/login" 
             style="background-color: #7598C1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đăng nhập ngay</a>
        </div>
        <hr style="border: none; border-top: 1px solid #7598C1; margin: 30px 0;">
        <p style="font-size: 11px; color: #888; text-align: center;">Đây là email tự động từ hệ thống Kindlink. Vui lòng không trả lời email này.</p>
      </div>
    `;
    return this.sendMail(email, subject, html);
  }

  async sendAccountLockEmail(email: string, reason: string): Promise<boolean> {
    const subject = 'Thông báo: Tài khoản Kindlink của bạn đã bị khóa';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #d32f2f; border-radius: 10px;">
        <h2 style="color: #d32f2f; text-align: center;">Tài khoản đã bị khóa</h2>
        <p>Chào bạn,</p>
        <p>Chúng tôi rất tiếc phải thông báo rằng tài khoản Kindlink của bạn đã bị tạm khóa bởi quản trị trị viên do vi phạm quy định hoặc lý do bảo mật.</p>
        <div style="background-color: #fce8e6; padding: 15px; border-left: 5px solid #d32f2f; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #d32f2f;">Lý do khóa:</p>
          <p style="margin: 5px 0; color: #333;">${reason}</p>
        </div>
        <p>Nếu bạn cho rằng đây là một sự nhầm lẫn, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi tại <a href="mailto:support@kindlink.org">support@kindlink.org</a> để được giải đáp.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 11px; color: #888; text-align: center;">Trân trọng,<br/>Kindlink Security Team</p>
      </div>
    `;
    return this.sendMail(email, subject, html);
  }

  async sendAccountUnlockEmail(email: string): Promise<boolean> {
    const subject = 'Thông báo: Khôi phục quyền truy cập tài khoản Kindlink';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #4CAF50; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">Tài khoản đã được mở khóa</h2>
        <p>Chào bạn,</p>
        <p>Chúc mừng! Tài khoản Kindlink của bạn đã được quản trị viên khôi phục quyền truy cập.</p>
        <p>Giờ đây bạn có thể đăng nhập vào hệ thống và tiếp tục các hoạt động thiện nguyện của mình.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${this.configService.get('WEB_URL') || 'http://localhost:3000'}/login" 
             style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đăng nhập ngay</a>
        </div>
        <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi tại <a href="mailto:support@kindlink.org">support@kindlink.org</a>.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 11px; color: #888; text-align: center;">Trân trọng,<br/>Kindlink Team</p>
      </div>
    `;
    return this.sendMail(email, subject, html);
  }
}
