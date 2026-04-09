import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;
  private redisErrorLogged = false;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('REDIS_HOST', '127.0.0.1');
    const port = this.config.get<number>('REDIS_PORT', 6379);
    const password = this.config.get<string>('REDIS_PASSWORD');
    const db = this.config.get<number>('REDIS_DB', 0);
    this.client = new Redis({
      host,
      port,
      db,
      ...(password ? { password } : {}),
      maxRetriesPerRequest: 2,
      lazyConnect: false,
    });

    // Sin listener, Node/ioredis muestra "Unhandled error event" en cada fallo de conexión.
    this.client.on('error', (err: Error) => {
      if (!this.redisErrorLogged) {
        this.redisErrorLogged = true;
        this.logger.warn(
          `Redis no disponible en ${host}:${port} (${err.message}). ` +
            'El OTP y los límites requieren Redis. Ejemplo: docker run -d -p 6379:6379 redis:alpine',
        );
      }
    });
    this.client.on('connect', () => {
      this.redisErrorLogged = false;
      this.logger.log(`Redis conectado en ${host}:${port}`);
    });
  }

  get redis(): Redis {
    return this.client;
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.client.quit();
    } catch {
      this.client.disconnect();
    }
  }
}
