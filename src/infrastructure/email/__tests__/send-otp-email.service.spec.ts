import { ConfigService } from '@nestjs/config';
import { SendOtpEmailService } from '../send-otp-email.service';
import type { EmailSenderPort } from '../../../domain/email/email-sender.port';
import type { EmailTemplatePort } from '../../../domain/email/email-template.port';

describe('SendOtpEmailService', () => {
  it('renders template and sends email', async () => {
    const sendEmail = jest.fn().mockResolvedValue(undefined);
    const emailSender = { sendEmail } as unknown as EmailSenderPort;
    const renderOtp = jest.fn().mockResolvedValue('<html></html>');
    const templates = { renderOtp } as unknown as EmailTemplatePort;
    const config = {
      get: jest.fn((key: string, def: unknown) => {
        if (key === 'OTP_TTL_SECONDS') return 600;
        if (key === 'EMAIL_SUBJECT_OTP') return 'Subject';
        if (key === 'EMAIL_HEADING_OTP') return 'Heading';
        return def;
      }),
    } as unknown as ConfigService;

    const service = new SendOtpEmailService(
      emailSender,
      templates,
      config,
    );

    await service.send('u@example.com', 'User', '123456');

    expect(renderOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'User',
        otpCode: '123456',
        expiresMinutes: 10,
        title: 'Heading',
      }),
    );
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'u@example.com',
        subject: 'Subject',
        html: '<html></html>',
      }),
    );
  });
});
