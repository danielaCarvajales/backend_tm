import { HttpException } from '@nestjs/common';
import { OtpIpRateLimitMiddleware } from '../otp-ip-rate-limit.middleware';
import { OtpAuditService } from '../otp-audit.service';
import { OtpRateLimitService } from '../otp-rate-limit.service';

describe('OtpIpRateLimitMiddleware', () => {
  it('calls next when IP limit passes', async () => {
    const rateLimit = {
      enforceIpLimit: jest.fn().mockResolvedValue(undefined),
    } as unknown as OtpRateLimitService;
    const audit = { logIpRateLimited: jest.fn() } as unknown as OtpAuditService;
    const middleware = new OtpIpRateLimitMiddleware(rateLimit, audit);
    const next = jest.fn();
    const req = {
      method: 'POST',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
    } as any;
    await middleware.use(req, {} as any, next);
    expect(next).toHaveBeenCalled();
    expect(audit.logIpRateLimited).not.toHaveBeenCalled();
  });

  it('logs and rethrows when IP limit fails', async () => {
    const rateLimit = {
      enforceIpLimit: jest
        .fn()
        .mockRejectedValue(
          new HttpException(
            { message: 'Demasiadas solicitudes.', code: 'RATE_LIMIT' },
            429,
          ),
        ),
    } as unknown as OtpRateLimitService;
    const audit = { logIpRateLimited: jest.fn() } as unknown as OtpAuditService;
    const middleware = new OtpIpRateLimitMiddleware(rateLimit, audit);
    const req = {
      method: 'POST',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
    } as any;
    await expect(
      middleware.use(req, {} as any, jest.fn()),
    ).rejects.toBeInstanceOf(HttpException);
    expect(audit.logIpRateLimited).toHaveBeenCalledWith('127.0.0.1');
  });
});
