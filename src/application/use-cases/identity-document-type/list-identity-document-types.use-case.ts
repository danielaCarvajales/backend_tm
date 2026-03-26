import { Inject, Injectable } from '@nestjs/common';
import {
  IdentityDocumentTypeListQuery,
  PaginatedResult,
} from '../../../domain/repositories/identity-document-type.repository';
import { IdentityDocumentType } from '../../../domain/entities/identity-document-type.entity';
import { IIdentityDocumentTypeRepository } from '../../../domain/repositories/identity-document-type.repository';
import { QueryIdentityDocumentTypeDto } from '../../dto/identity-document-type/query-identity-document-type.dto';
import { IDENTITY_DOCUMENT_TYPE_REPOSITORY } from '../../tokens/identity-document-type.repository.token';

@Injectable()
export class ListIdentityDocumentTypesUseCase {
  constructor(
    @Inject(IDENTITY_DOCUMENT_TYPE_REPOSITORY)
    private readonly repository: IIdentityDocumentTypeRepository,
  ) {}

  async execute(
    query: QueryIdentityDocumentTypeDto,
  ): Promise<PaginatedResult<IdentityDocumentType>> {
    const domainQuery: IdentityDocumentTypeListQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      search: query.search,
    };
    return this.repository.findPaginated(domainQuery);
  }
}
