import { Injectable, Logger } from '@nestjs/common';
import { hashEmailIdentifier } from './otp-hash.util';

export type OtpAuditOutcome =
  | 'accepted'
  | 'rate_limited_email'
  | 'rate_limited_ip'
  | 'dependency_unavailable'
  | 'skipped_unknown_email'
  | 'otp_sent'
  | 'email_send_failed'
  | 'otp_store_failed';

@Injectable()
export class OtpAuditService {
  private readonly logger = new Logger(OtpAuditService.name);

  logRequest(params: {
    clientIp: string;
    normalizedEmail: string;
    outcome: OtpAuditOutcome;
  }): void {
    const emailHash = hashEmailIdentifier(params.normalizedEmail);
    const ts = new Date().toISOString();
    this.logger.log(
      `OTP_AUDIT ts=${ts} ip=${params.clientIp} emailHash=${emailHash} outcome=${params.outcome}`,
    );
  }

  logIpRateLimited(clientIp: string): void {
    const ts = new Date().toISOString();
    this.logger.log(
      `OTP_AUDIT ts=${ts} ip=${clientIp} emailHash=n/a outcome=rate_limited_ip`,
    );
  }
}
