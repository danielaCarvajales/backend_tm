import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { hashEmailIdentifier } from './otp-hash.util';

@Injectable()
export class OtpRateLimitService {
  constructor(
    private readonly redisService: RedisService,
    private readonly config: ConfigService,
  ) {}

  private get emailWindowSec(): number {
    return this.config.get<number>('OTP_RL_EMAIL_WINDOW_SEC', 300);
  }

  private get emailMax(): number {
    return this.config.get<number>('OTP_RL_EMAIL_MAX', 3);
  }

  private get ipWindowSec(): number {
    return this.config.get<number>('OTP_RL_IP_WINDOW_SEC', 60);
  }

  private get ipMax(): number {
    return this.config.get<number>('OTP_RL_IP_MAX', 10);
  }

  //Per-email: max N requests per window (Redis INCR + EXPIRE).
  async enforceEmailLimit(normalizedEmail: string): Promise<void> {
    try {
      const key = `otp:rl:em:${hashEmailIdentifier(normalizedEmail)}`;
      const count = await this.redisService.redis.incr(key);
      if (count === 1) {
        await this.redisService.redis.expire(key, this.emailWindowSec);
      }
      if (count > this.emailMax) {
        throw new HttpException(
          {
            message:
              'Demasiadas solicitudes para este correo. Intente más tarde.',
            code: 'RATE_LIMIT',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException(
        {
          message:
            'El servicio no está disponible en este momento. Intente más tarde.',
          code: 'SERVICE_UNAVAILABLE',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  //Per-IP: max N requests per minute.
  async enforceIpLimit(clientIp: string): Promise<void> {
    try {
      const safeIp = clientIp || 'unknown';
      const key = `otp:rl:ip:${safeIp}`;
      const count = await this.redisService.redis.incr(key);
      if (count === 1) {
        await this.redisService.redis.expire(key, this.ipWindowSec);
      }
      if (count > this.ipMax) {
        throw new HttpException(
          {
            message:
              'Demasiadas solicitudes desde esta dirección. Intente más tarde.',
            code: 'RATE_LIMIT',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException(
        {
          message:
            'El servicio no está disponible en este momento. Intente más tarde.',
          code: 'SERVICE_UNAVAILABLE',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
