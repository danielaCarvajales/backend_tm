import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthContext } from '../../../application/auth/auth-context';
import { JwtPayload } from '../strategies/jwt.strategy';

export const AuthContextUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthContext => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return {
      userId: user.userId,
      email: user.email,
      credentialId: user.credentialId,
      companyId: user.codeCompany,
      role: user.role,
      idPersonRole: user.idPersonRole,
    };
  },
);
