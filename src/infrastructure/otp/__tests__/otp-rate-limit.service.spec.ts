import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpRateLimitService } from '../otp-rate-limit.service';
import { RedisService } from '../../redis/redis.service';

describe('OtpRateLimitService', () => {
  let service: OtpRateLimitService;
  let incr: jest.Mock;
  let expire: jest.Mock;

  beforeEach(() => {
    incr = jest.fn();
    expire = jest.fn();
    const redis = {
      incr,
      expire,
    };
    const redisService = { redis } as unknown as RedisService;
    const config = {
      get: jest.fn((key: string, def: unknown) => {
        if (key === 'OTP_RL_EMAIL_MAX') return 3;
        if (key === 'OTP_RL_EMAIL_WINDOW_SEC') return 600;
        if (key === 'OTP_RL_IP_MAX') return 10;
        if (key === 'OTP_RL_IP_WINDOW_SEC') return 60;
        return def;
      }),
    } as unknown as ConfigService;
    service = new OtpRateLimitService(redisService, config);
  });

  it('enforceEmailLimit allows up to max requests', async () => {
    incr.mockResolvedValueOnce(1);
    incr.mockResolvedValueOnce(2);
    incr.mockResolvedValueOnce(3);
    await service.enforceEmailLimit('a@b.co');
    await service.enforceEmailLimit('a@b.co');
    await service.enforceEmailLimit('a@b.co');
    expect(incr).toHaveBeenCalled();
  });

  it('enforceEmailLimit throws when over max', async () => {
    incr.mockResolvedValue(4);
    await expect(service.enforceEmailLimit('a@b.co')).rejects.toBeInstanceOf(
      HttpException,
    );
  });

  it('enforceIpLimit sets expire on first increment', async () => {
    incr.mockResolvedValueOnce(1);
    expire.mockResolvedValue(1);
    await service.enforceIpLimit('1.2.3.4');
    expect(expire).toHaveBeenCalledWith(expect.any(String), 60);
  });

  it('maps Redis errors to 503 without leaking details', async () => {
    incr.mockRejectedValue(new Error('Stream is not writeable'));
    let caught: unknown;
    try {
      await service.enforceIpLimit('1.2.3.4');
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(HttpException);
    const ex = caught as HttpException;
    expect(ex.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(ex.getResponse()).toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
    });
  });
});
