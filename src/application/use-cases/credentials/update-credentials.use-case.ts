import { Inject, Injectable } from '@nestjs/common';
import { Credentials } from '../../../domain/entities/credentials.entity';
import { ICredentialsRepository } from '../../../domain/repositories/credentials.repository';
import { UpdateCredentialsDto } from '../../dto/credentials/update-credentials.dto';
import { CREDENTIALS_REPOSITORY } from '../../tokens/credentials.repository.token';
import { hashPassword } from '../../../infrastructure/auth/utils/password.util';
import { AuthContext, ensureCompanyAccess } from '../../auth/auth-context';

@Injectable()
export class UpdateCredentialsUseCase {
  constructor(
    @Inject(CREDENTIALS_REPOSITORY)
    private readonly repository: ICredentialsRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateCredentialsDto,
    authContext?: AuthContext,
  ): Promise<Credentials> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('CREDENTIALS_NOT_FOUND');
    }
    if (authContext) {
      ensureCompanyAccess(authContext, existing.codeCompany);
    }
    const password = dto.password
      ? await hashPassword(dto.password)
      : existing.password;
    const updated = new Credentials(
      id,
      dto.username ?? existing.username,
      password,
      dto.state ?? existing.state,
      dto.lastAccess ? new Date(dto.lastAccess) : existing.lastAccess,
      dto.idPerson ?? existing.idPerson,
      existing.codeCompany,
      dto.failedAttempts ?? existing.failedAttempts,
      dto.accountLockedUntil !== undefined
        ? (dto.accountLockedUntil ? new Date(dto.accountLockedUntil) : null)
        : existing.accountLockedUntil,
    );
    return this.repository.update(updated);
  }
}
