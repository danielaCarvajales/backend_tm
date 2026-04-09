import {Body,Controller,Get,HttpCode,HttpStatus,Post,Req,UseGuards,} from '@nestjs/common';
import { Request } from 'express';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { ResetPasswordWithOtpUseCase } from '../../application/use-cases/auth/reset-password-with-otp.use-case';
import { SendOtpUseCase } from '../../application/use-cases/auth/send-otp.use-case';
import { VerifyOtpUseCase } from '../../application/use-cases/auth/verify-otp.use-case';
import { LoginDto } from '../../application/dto/auth/login.dto';
import { ResetPasswordWithOtpDto } from '../../application/dto/auth/reset-password-with-otp.dto';
import { SendOtpDto } from '../../application/dto/auth/send-otp.dto';
import { VerifyOtpDto } from '../../application/dto/auth/verify-otp.dto';
import { Public } from '../../infrastructure/auth/decorators/public.decorator';
import { CurrentUser } from '../../infrastructure/auth/decorators/current-user.decorator';
import { JwtPayload } from '../../infrastructure/auth/strategies/jwt.strategy';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';
import { getClientIp } from '../../infrastructure/http/client-ip.util';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly sendOtpUseCase: SendOtpUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
    private readonly resetPasswordWithOtpUseCase: ResetPasswordWithOtpUseCase,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ipAddress = getClientIp(req) || undefined;
    const result = await this.loginUseCase.execute(dto, ipAddress);
    return {
      data: result,
      message: 'Inicio de sesión exitoso',
    };
  }

  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: SendOtpDto, @Req() req: Request) {
    const ip = getClientIp(req);
    return this.sendOtpUseCase.execute(dto, ip);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.verifyOtpUseCase.execute(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordWithOtpDto) {
    return this.resetPasswordWithOtpUseCase.execute(dto);
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
