/** Comando de envío desacoplado del proveedor (capa dominio / contrato de aplicación). */
export interface EmailAttachmentDto {
  filename: string;
  content: Buffer;
  contentType?: string;
  /** Content-ID para imágenes inline (opcional). */
  cid?: string;
}

export interface SendEmailDto {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: EmailAttachmentDto[];
}
