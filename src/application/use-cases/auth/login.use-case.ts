import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from '../../../infrastructure/auth/utils/password.util';
import { Credentials } from '../../../domain/entities/credentials.entity';
import { ICredentialsRepository } from '../../../domain/repositories/credentials.repository';
import { IPersonRepository } from '../../../domain/repositories/person.repository';
import { IPersonRoleRepository } from '../../../domain/repositories/person-role.repository';
import { ICustomerProfileRepository } from '../../../domain/repositories/customer-profile.repository';
import { IAuthAuditRepository } from '../../../domain/repositories/auth-audit.repository';
import { CREDENTIALS_REPOSITORY } from '../../tokens/credentials.repository.token';
import { PERSON_REPOSITORY } from '../../tokens/person.repository.token';
import { PERSON_ROLE_REPOSITORY } from '../../tokens/person-role.repository.token';
import { CUSTOMER_PROFILE_REPOSITORY } from '../../tokens/customer-profile.repository.token';
import { AUTH_AUDIT_REPOSITORY } from '../../tokens/auth-audit.repository.token';
import { LoginDto } from '../../dto/auth/login.dto';
import { nowColombia } from '../../../infrastructure/utils/date.util';
import type { ClientProfileFull } from '../../../domain/repositories/customer-profile.repository';

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 5;
const ROLE_CLIENTE = 'cliente';

export interface LoginResult {
  accessToken: string;
  expiresIn: number;
  expire: string;
  user: {
    userId: number;
    email: string;
    credentialId: number;
    codeCompany: number;
    role: string;
    idPersonRole?: number;
  };
  customerProfile?: ClientProfileFull;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(CREDENTIALS_REPOSITORY)
    private readonly credentialsRepo: ICredentialsRepository,
    @Inject(PERSON_REPOSITORY)
    private readonly personRepo: IPersonRepository,
    @Inject(PERSON_ROLE_REPOSITORY)
    private readonly personRoleRepo: IPersonRoleRepository,
    @Inject(CUSTOMER_PROFILE_REPOSITORY)
    private readonly customerProfileRepo: ICustomerProfileRepository,
    @Inject(AUTH_AUDIT_REPOSITORY)
    private readonly auditRepo: IAuthAuditRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto, ipAddress?: string): Promise<LoginResult> {
    const { username, password, codeCompany } = dto;

    // 1. Find credentials by username + codeCompany
    const credentials = await this.credentialsRepo.findByUsernameAndCompany(username, codeCompany);
    if (!credentials) {
      await this.auditRepo.logLoginAttempt(username, codeCompany, false, ipAddress);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Check account lockout (brute-force protection)
    if (credentials.accountLockedUntil && credentials.accountLockedUntil > new Date()) {
      await this.auditRepo.logLoginAttempt(username, codeCompany, false, ipAddress);
      throw new UnauthorizedException(
        `Cuenta bloqueada temporalmente. Intente nuevamente después de ${LOCKOUT_MINUTES} minutos.`,
      );
    }

    // 3. Constant-time password comparison (timing attack protection)
    const passwordMatches = await comparePassword(password, credentials.password);

    if (!passwordMatches) {
      await this.handleFailedLogin(credentials, username, codeCompany, ipAddress);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const updatedCredentials = new Credentials(
      credentials.id,
      credentials.username,
      credentials.password,
      credentials.state,
      nowColombia(),
      credentials.idPerson,
      credentials.codeCompany,
      0,
      null,
    );
    await this.credentialsRepo.update(updatedCredentials);

    // 5. Get active person_role (idPersonRole + roleName)
    const activePersonRole = await this.personRoleRepo.findActivePersonRole(
      credentials.idPerson,
      codeCompany,
    );
    if (!activePersonRole) {
      await this.auditRepo.logLoginAttempt(username, codeCompany, false, ipAddress);
      throw new UnauthorizedException('No tiene un rol activo asignado para esta empresa');
    }

    const { idPersonRole, roleName: role } = activePersonRole;

    // 6. Get email from Person
    const person = await this.personRepo.findById(
      credentials.idPerson,
      codeCompany,
    );
    const email = person?.email ?? '';

    await this.auditRepo.logLoginAttempt(username, codeCompany, true, ipAddress);

    // 7. If role = cliente, fetch full customer profile with JOINs
    let customerProfile: ClientProfileFull | undefined;
    if (role.toLowerCase() === ROLE_CLIENTE) {
      customerProfile =
        (await this.customerProfileRepo.findFullProfileByIdPersonRole(idPersonRole)) ?? undefined;
    }

    const payload = {
      userId: credentials.idPerson,
      email,
      credentialId: credentials.id!,
      codeCompany,
      role,
      idPersonRole,
    };
    const expiresIn = 86400;
    const accessToken = this.jwtService.sign(payload, { expiresIn });
    const expire = 'Expira en 24 horas';

    return {
      accessToken,
      user: {
        userId: credentials.idPerson,
        email,
        credentialId: credentials.id!,
        codeCompany,
        role,
        idPersonRole,
      },
      expiresIn,
      expire,
      customerProfile,
    };
  }

  private async handleFailedLogin(
    credentials: Credentials,
    username: string,
    codeCompany: number,
    ipAddress?: string,
  ): Promise<void> {
    const newFailedAttempts = credentials.failedAttempts + 1;
    let accountLockedUntil: Date | null = null;

    if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
      accountLockedUntil = new Date();
      accountLockedUntil.setMinutes(accountLockedUntil.getMinutes() + LOCKOUT_MINUTES);
    }

    const updated = new Credentials(
      credentials.id,
      credentials.username,
      credentials.password,
      credentials.state,
      credentials.lastAccess,
      credentials.idPerson,
      credentials.codeCompany,
      newFailedAttempts,
      accountLockedUntil,
    );
    await this.credentialsRepo.update(updated);
    await this.auditRepo.logLoginAttempt(username, codeCompany, false, ipAddress);
  }
}
