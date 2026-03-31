import { Inject, Injectable } from '@nestjs/common';
import { Document } from '../../../domain/entities/document.entity';
import {
  DocumentListQuery,
  IDocumentRepository,
  PaginatedResult,
} from '../../../domain/repositories/document.repository';
import { QueryDocumentDto } from '../../dto/document/query-document.dto';
import { DOCUMENT_REPOSITORY } from '../../tokens/document.repository.token';

@Injectable()
export class ListDocumentsUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly repository: IDocumentRepository,
  ) {}

  async execute(
    query: QueryDocumentDto,
  ): Promise<PaginatedResult<Document>> {
    const domainQuery: DocumentListQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      search: query.search,
    };
    return this.repository.findPaginated(domainQuery);
  }
}
