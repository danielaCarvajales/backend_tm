import { Inject, Injectable } from '@nestjs/common';
import {
  CredentialsListQuery,
  CredentialsPaginatedResult,
} from '../../../domain/repositories/credentials.repository';
import { Credentials } from '../../../domain/entities/credentials.entity';
import { ICredentialsRepository } from '../../../domain/repositories/credentials.repository';
import { QueryCredentialsDto } from '../../dto/credentials/query-credentials.dto';
import { CREDENTIALS_REPOSITORY } from '../../tokens/credentials.repository.token';
import { AuthContext, ensureCompanyAccess } from '../../auth/auth-context';

@Injectable()
export class ListCredentialsUseCase {
  constructor(
    @Inject(CREDENTIALS_REPOSITORY)
    private readonly repository: ICredentialsRepository,
  ) {}

  async execute(
    query: QueryCredentialsDto,
    authContext?: AuthContext,
  ): Promise<CredentialsPaginatedResult<Credentials>> {
    const domainQuery: CredentialsListQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      search: query.search,
    };
    const result = await this.repository.findPaginated(domainQuery);
    if (!authContext) {
      return result;
    }
    const scoped = result.data.filter((credential) => {
      try {
        ensureCompanyAccess(authContext, credential.codeCompany);
        return true;
      } catch {
        return false;
      }
    });
    return {
      ...result,
      data: scoped,
      totalItems: scoped.length,
      totalPages: 1,
      currentPage: 1,
      pageSize: scoped.length || result.pageSize,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }
}
