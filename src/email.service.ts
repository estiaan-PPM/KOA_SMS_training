import { Injectable } from "@nestjs/common";

// email.service.ts
@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, token: string): Promise<void> {
    const confirmationUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;
    
    await this.mailerService.sendMail({
      to: email,
      subject: 'Confirm Your Email Address',
      template: 'confirmation',
      context: {
        confirmationUrl,
      },
    });
  }
}