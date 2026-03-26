import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { LoginUseCase } from '../application/use-cases/auth/login.use-case';
import { JwtStrategy } from '../infrastructure/auth/strategies/jwt.strategy';
import { CREDENTIALS_REPOSITORY } from '../application/tokens/credentials.repository.token';
import { PERSON_REPOSITORY } from '../application/tokens/person.repository.token';
import { AUTH_AUDIT_REPOSITORY } from '../application/tokens/auth-audit.repository.token';
import { CredentialsTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/credentials.repository';
import { PersonTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/person.repository';
import { AuthAuditTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/auth-audit.repository';
import { PersonRoleModule } from './person-role.module';
import { CustomerProfileModule } from './customer-profile.module';

@Module({
  imports: [
    PersonRoleModule,
    CustomerProfileModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          algorithm: 'HS256',
          expiresIn: '24h',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    JwtStrategy,
    {
      provide: CREDENTIALS_REPOSITORY,
      useClass: CredentialsTypeOrmRepository,
    },
    {
      provide: PERSON_REPOSITORY,
      useClass: PersonTypeOrmRepository,
    },
    {
      provide: AUTH_AUDIT_REPOSITORY,
      useClass: AuthAuditTypeOrmRepository,
    },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
