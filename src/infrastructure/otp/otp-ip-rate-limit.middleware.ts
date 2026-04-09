import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { getClientIp } from '../http/client-ip.util';
import { OtpAuditService } from './otp-audit.service';
import { OtpRateLimitService } from './otp-rate-limit.service';

@Injectable()
export class OtpIpRateLimitMiddleware implements NestMiddleware {
  constructor(
    private readonly rateLimit: OtpRateLimitService,
    private readonly audit: OtpAuditService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const ip = getClientIp(req);
    try {
      await this.rateLimit.enforceIpLimit(ip);
    } catch (e) {
      if (
        e instanceof HttpException &&
        e.getStatus() === HttpStatus.TOO_MANY_REQUESTS
      ) {
        this.audit.logIpRateLimited(ip);
      }
      throw e;
    }
    next();
  }
}
