import { Inject, Injectable } from '@nestjs/common';
import {
  CredentialsListQuery,
  CredentialsPaginatedResult,
} from '../../../domain/repositories/credentials.repository';
import { Credentials } from '../../../domain/entities/credentials.entity';
import { ICredentialsRepository } from '../../../domain/repositories/credentials.repository';
import { QueryCredentialsDto } from '../../dto/credentials/query-credentials.dto';
import { CREDENTIALS_REPOSITORY } from '../../tokens/credentials.repository.token';

@Injectable()
export class ListCredentialsUseCase {
  constructor(
    @Inject(CREDENTIALS_REPOSITORY)
    private readonly repository: ICredentialsRepository,
  ) {}

  async execute(query: QueryCredentialsDto): Promise<CredentialsPaginatedResult<Credentials>> {
    const domainQuery: CredentialsListQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      search: query.search,
    };
    return this.repository.findPaginated(domainQuery);
  }
}
