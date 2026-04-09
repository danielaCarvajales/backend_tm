import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import {
  generateNumericOtp,
  hashEmailIdentifier,
  hashOtpForStorage,
  timingSafeEqualHex,
} from './otp-hash.util';

@Injectable()
export class OtpStoreService {
  constructor(
    private readonly redisService: RedisService,
    private readonly config: ConfigService,
  ) {}

  private get ttlSec(): number {
    return this.config.get<number>('OTP_TTL_SECONDS', 600);
  }

  private get secret(): string {
    const s = this.config.get<string>('OTP_SECRET');
    if (!s || s.length < 32) {
      throw new Error('OTP_SECRET debe estar configurada y tener al menos 32 caracteres');
    }
    return s;
  }

  private keyFor(normalizedEmail: string): string {
    return `otp:h:${hashEmailIdentifier(normalizedEmail)}`;
  }

  // Generar y almacenar el OTP en Redis
  async createAndStoreOtp(normalizedEmail: string): Promise<string> {
    const plain = generateNumericOtp();
    const digest = hashOtpForStorage(normalizedEmail, plain, this.secret);
    const key = this.keyFor(normalizedEmail);
    await this.redisService.redis.setex(key, this.ttlSec, digest);
    return plain;
  }

  async removeOtp(normalizedEmail: string): Promise<void> {
    const key = this.keyFor(normalizedEmail);
    await this.redisService.redis.del(key);
  }

  async isOtpValid(normalizedEmail: string, plainOtp: string): Promise<boolean> {
    const key = this.keyFor(normalizedEmail);
    const storedDigest = await this.redisService.redis.get(key);
    if (!storedDigest) {
      return false;
    }
    const candidateDigest = hashOtpForStorage(normalizedEmail, plainOtp, this.secret);
    return timingSafeEqualHex(storedDigest, candidateDigest);
  }

  async consumeOtp(normalizedEmail: string): Promise<void> {
    await this.removeOtp(normalizedEmail);
  }
}
