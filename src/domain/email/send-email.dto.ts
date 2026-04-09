//Comando de envío desacoplado del proveedor 
export interface EmailAttachmentDto {
  filename: string;
  content: Buffer;
  contentType?: string;
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
