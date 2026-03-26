import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { LoginDto } from '../../application/dto/auth/login.dto';
import { Public } from '../../infrastructure/auth/decorators/public.decorator';
import { CurrentUser } from '../../infrastructure/auth/decorators/current-user.decorator';
import { JwtPayload } from '../../infrastructure/auth/strategies/jwt.strategy';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';


function getClientIp(req: Request): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ipAddress = getClientIp(req);
    const result = await this.loginUseCase.execute(dto, ipAddress);
    return {
      data: result,
      message: 'Inicio de sesión exitoso',
    };
  }

  
  @Post('me')
  async me(@CurrentUser() user: JwtPayload) {
    return {
      data: {
        userId: user.userId,
        email: user.email,
        credentialId: user.credentialId,
        codeCompany: user.codeCompany,
        role: user.role,
      },
      message: 'Usuario autenticado',
    };
  }

  
  @Get('admin-only')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  adminOnly(@CurrentUser() user: JwtPayload) {
    return {
      data: { message: 'Acceso concedido para administrador', user: user.userId },
      message: 'Recurso exclusivo para administradores',
    };
  }
}
