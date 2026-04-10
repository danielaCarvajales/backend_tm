import { Inject, Injectable } from '@nestjs/common';
import { ICredentialsRepository } from '../../../domain/repositories/credentials.repository';
import { CREDENTIALS_REPOSITORY } from '../../tokens/credentials.repository.token';
import { AuthContext, ensureCompanyAccess } from '../../auth/auth-context';

@Injectable()
export class DeleteCredentialsUseCase {
  constructor(
    @Inject(CREDENTIALS_REPOSITORY)
    private readonly repository: ICredentialsRepository,
  ) {}

  async execute(id: number, authContext?: AuthContext): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('CREDENTIALS_NOT_FOUND');
    }
    if (authContext) {
      ensureCompanyAccess(authContext, existing.codeCompany);
    }
    await this.repository.delete(id);
  }
}
