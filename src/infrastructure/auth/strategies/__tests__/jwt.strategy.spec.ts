import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy, JwtPayload } from '../jwt.strategy';

describe('JwtStrategy', () => {
  const secret64 = 'a'.repeat(64);

  it('falla al construir si JWT_SECRET falta o es corto', () => {
    const short = { get: jest.fn().mockReturnValue('short') } as unknown as ConfigService;
    expect(() => new JwtStrategy(short)).toThrow(/JWT_SECRET/);

    const empty = { get: jest.fn().mockReturnValue(undefined) } as unknown as ConfigService;
    expect(() => new JwtStrategy(empty)).toThrow(/JWT_SECRET/);
  });

  it('validate devuelve el payload si incluye los campos obligatorios', () => {
    const config = {
      get: jest.fn().mockReturnValue(secret64),
    } as unknown as ConfigService;
    const strategy = new JwtStrategy(config);

    const payload: JwtPayload = {
      userId: 10,
      email: 'u@tm.com',
      credentialId: 20,
      codeCompany: 30,
      role: 'cliente',
      idPersonRole: 40,
    };

    expect(strategy.validate(payload)).toEqual(payload);
  });

  it('validate lanza UnauthorizedException si falta un campo requerido', () => {
    const config = {
      get: jest.fn().mockReturnValue(secret64),
    } as unknown as ConfigService;
    const strategy = new JwtStrategy(config);

    const incomplete = {
      userId: 10,
      email: 'u@tm.com',
      credentialId: 20,
      codeCompany: 30,
    } as JwtPayload;

    expect(() => strategy.validate(incomplete)).toThrow(UnauthorizedException);
  });
});
