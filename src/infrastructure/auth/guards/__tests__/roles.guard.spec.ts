import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { JwtPayload } from '../../strategies/jwt.strategy';
import { RolesGuard } from '../roles.guard';

function mockContext(user?: JwtPayload): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn(),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('permite el acceso si no hay roles requeridos en metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(mockContext())).toBe(true);
  });

  it('permite el acceso si la lista de roles requeridos está vacía', () => {
    reflector.getAllAndOverride.mockReturnValue([]);

    expect(guard.canActivate(mockContext())).toBe(true);
  });

  it('lanza ForbiddenException si hay rol requerido y no hay usuario en request', () => {
    reflector.getAllAndOverride.mockReturnValue(['administrador']);

    expect(() => guard.canActivate(mockContext(undefined))).toThrow(
      ForbiddenException,
    );
  });

  it('lanza ForbiddenException si el rol del usuario no coincide', () => {
    reflector.getAllAndOverride.mockReturnValue(['administrador']);
    const user: JwtPayload = {
      userId: 1,
      email: 'a@b.com',
      credentialId: 1,
      codeCompany: 1,
      role: 'cliente',
    };

    expect(() => guard.canActivate(mockContext(user))).toThrow(
      ForbiddenException,
    );
  });

  it('permite el acceso si el rol coincide (comparación sin sensibilidad a mayúsculas)', () => {
    reflector.getAllAndOverride.mockReturnValue(['Administrador']);
    const user: JwtPayload = {
      userId: 1,
      email: 'a@b.com',
      credentialId: 1,
      codeCompany: 1,
      role: 'administrador',
    };

    expect(guard.canActivate(mockContext(user))).toBe(true);
  });
});
