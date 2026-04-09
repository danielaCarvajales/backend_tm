import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  userId: number;
  email: string;
  credentialId: number;
  codeCompany: number;
  role: string;
  idPersonRole?: number;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret || secret.length < 64) {
      throw new Error(
        'JWT_SECRET debe estar configurada y tener al menos 64 caracteres por seguridad. Revise .env',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'],
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    if (!payload.userId || !payload.credentialId || !payload.codeCompany || !payload.role) {
      throw new UnauthorizedException('Token inválido o malformado');
    }
    return payload;
  }
}
