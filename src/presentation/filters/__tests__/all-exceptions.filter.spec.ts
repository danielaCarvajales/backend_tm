import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from '../all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  it('maps unknown errors to generic 500 body', () => {
    const filter = new AllExceptionsFilter();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status };
    const request = { url: '/api/auth/send-otp' };
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(new Error('secret'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Error interno del servidor',
        path: '/api/auth/send-otp',
      }),
    );
  });

  it('passes through HttpException body', () => {
    const filter = new AllExceptionsFilter();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status };
    const request = { url: '/x' };
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(
      new HttpException(
        { message: 'Demasiadas solicitudes. Intente más tarde.', code: 'RATE_LIMIT' },
        429,
      ),
      host,
    );

    expect(status).toHaveBeenCalledWith(429);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 429,
        message: 'Demasiadas solicitudes. Intente más tarde.',
        code: 'RATE_LIMIT',
        path: '/x',
      }),
    );
  });
});
