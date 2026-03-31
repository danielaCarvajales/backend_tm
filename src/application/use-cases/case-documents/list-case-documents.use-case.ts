import { Inject, Injectable } from '@nestjs/common';
import {
  ICaseDocumentsRepository,
  CaseDocumentsListQuery,
  CaseDocumentsPaginatedResult,
  CaseDocumentsWithRelations,
} from '../../../domain/repositories/case-documents.repository';
import { QueryCaseDocumentsDto } from '../../dto/case-documents/query-case-documents.dto';
import { CASE_DOCUMENTS_REPOSITORY } from '../../tokens/case-documents.repository.token';

@Injectable()
export class ListCaseDocumentsUseCase {
  constructor(
    @Inject(CASE_DOCUMENTS_REPOSITORY)
    private readonly repository: ICaseDocumentsRepository,
  ) {}

  async execute(
    query: QueryCaseDocumentsDto,
  ): Promise<
    CaseDocumentsPaginatedResult<CaseDocumentsWithRelations>
  > {
    const domainQuery: CaseDocumentsListQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      idCase: query.idCase,
    };
    return this.repository.findPaginated(domainQuery);
  }
}
