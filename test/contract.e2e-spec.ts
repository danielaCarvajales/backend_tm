import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

/**
 * Requiere variables de entorno válidas (p. ej. MySQL, JWT_SECRET ≥ 64 caracteres).
 * Verifica que el módulo de contratos está montado: rutas protegidas responden 401 sin token.
 */
describe('ContractController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  }, 120_000);

  afterAll(async () => {
    const dataSource = app.get(DataSource);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    await app.close();
  });

  it('GET /api/contracts responde 401 sin encabezado Authorization', () => {
    return request(app.getHttpServer())
      .get('/api/contracts')
      .expect(401);
  });

  it('GET /api/contracts/by-case/1 responde 401 sin token', () => {
    return request(app.getHttpServer())
      .get('/api/contracts/by-case/1')
      .expect(401);
  });
});
