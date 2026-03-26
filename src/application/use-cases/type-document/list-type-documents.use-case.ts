import { Inject, Injectable } from '@nestjs/common';
import {
  TypeDocumentListQuery,
  TypeDocumentPaginatedResult,
} from '../../../domain/repositories/type-document.repository';
import { TypeDocument } from '../../../domain/entities/type-document.entity';
import { ITypeDocumentRepository } from '../../../domain/repositories/type-document.repository';
import { QueryTypeDocumentDto } from '../../dto/type-document/query-type-document.dto';
import { TYPE_DOCUMENT_REPOSITORY } from '../../tokens/type-document.repository.token';

@Injectable()
export class ListTypeDocumentsUseCase {
  constructor(
    @Inject(TYPE_DOCUMENT_REPOSITORY)
    private readonly repository: ITypeDocumentRepository,
  ) {}

  async execute(
    query: QueryTypeDocumentDto,
  ): Promise<TypeDocumentPaginatedResult<TypeDocument>> {
    const domainQuery: TypeDocumentListQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      search: query.search,
    };
    return this.repository.findPaginated(domainQuery);
  }
}
