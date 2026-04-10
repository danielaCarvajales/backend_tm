import { Inject, Injectable } from '@nestjs/common';
import { Credentials } from '../../../domain/entities/credentials.entity';
import { ICredentialsRepository } from '../../../domain/repositories/credentials.repository';
import { CREDENTIALS_REPOSITORY } from '../../tokens/credentials.repository.token';
import { AuthContext, ensureCompanyAccess } from '../../auth/auth-context';

@Injectable()
export class GetCredentialsByIdUseCase {
  constructor(
    @Inject(CREDENTIALS_REPOSITORY)
    private readonly repository: ICredentialsRepository,
  ) {}

  async execute(id: number, authContext?: AuthContext): Promise<Credentials | null> {
    const credentials = await this.repository.findById(id);
    if (!credentials) {
      return null;
    }
    if (authContext) {
      ensureCompanyAccess(authContext, credentials.codeCompany);
    }
    return credentials;
  }
}
