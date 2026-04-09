import type { SendEmailDto } from './send-email.dto';

  //Puerto de salida: envío de correo. Implementado en infrastructure (Nodemailer, Resend, SendGrid).
export interface EmailSenderPort {
  sendEmail(payload: SendEmailDto): Promise<void>;
}
