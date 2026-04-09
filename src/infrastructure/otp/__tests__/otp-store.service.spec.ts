import { ConfigService } from '@nestjs/config';
import { OtpStoreService } from '../otp-store.service';
import { RedisService } from '../../redis/redis.service';
import { hashEmailIdentifier, hashOtpForStorage } from '../otp-hash.util';

describe('OtpStoreService', () => {
  let service: OtpStoreService;
  let setex: jest.Mock;
  let del: jest.Mock;
  let get: jest.Mock;
  const secret = 's'.repeat(32);

  beforeEach(() => {
    setex = jest.fn().mockResolvedValue('OK');
    del = jest.fn().mockResolvedValue(1);
    get = jest.fn().mockResolvedValue(null);
    const redisService = {
      redis: { setex, del, get },
    } as unknown as RedisService;
    const config = {
      get: jest.fn((key: string, def: unknown) => {
        if (key === 'OTP_SECRET') return secret;
        if (key === 'OTP_TTL_SECONDS') return 600;
        return def;
      }),
    } as unknown as ConfigService;
    service = new OtpStoreService(redisService, config);
  });

  it('createAndStoreOtp stores HMAC digest not plaintext', async () => {
    const email = 'user@example.com';
    const plain = await service.createAndStoreOtp(email);
    expect(plain).toMatch(/^\d{6}$/);
    expect(setex).toHaveBeenCalledWith(
      `otp:h:${hashEmailIdentifier(email)}`,
      600,
      hashOtpForStorage(email, plain, secret),
    );
  });

  it('removeOtp deletes key', async () => {
    await service.removeOtp('user@example.com');
    expect(del).toHaveBeenCalledWith(
      `otp:h:${hashEmailIdentifier('user@example.com')}`,
    );
  });

  it('isOtpValid returns true for valid OTP digest', async () => {
    const email = 'user@example.com';
    const otp = '123456';
    get.mockResolvedValue(hashOtpForStorage(email, otp, secret));

    await expect(service.isOtpValid(email, otp)).resolves.toBe(true);
  });

  it('isOtpValid returns false for wrong OTP', async () => {
    const email = 'user@example.com';
    get.mockResolvedValue(hashOtpForStorage(email, '654321', secret));

    await expect(service.isOtpValid(email, '123456')).resolves.toBe(false);
  });

  it('consumeOtp removes the stored OTP', async () => {
    await service.consumeOtp('user@example.com');
    expect(del).toHaveBeenCalledWith(
      `otp:h:${hashEmailIdentifier('user@example.com')}`,
    );
  });
});
