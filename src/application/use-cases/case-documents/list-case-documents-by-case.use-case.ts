import { Inject, Injectable } from '@nestjs/common';
import {
  CaseDocumentsListQuery,
  CaseDocumentsPaginatedResult,
  CaseDocumentsWithRelations,
  ICaseDocumentsRepository,
} from '../../../domain/repositories/case-documents.repository';
import { ICaseRecordRepository } from '../../../domain/repositories/case-record.repository';
import { CASE_DOCUMENTS_REPOSITORY } from '../../tokens/case-documents.repository.token';
import { CASE_RECORD_REPOSITORY } from '../../tokens/case-record.repository.token';

@Injectable()
export class ListCaseDocumentsByCaseUseCase {
  constructor(
    @Inject(CASE_DOCUMENTS_REPOSITORY)
    private readonly caseDocumentsRepository: ICaseDocumentsRepository,
    @Inject(CASE_RECORD_REPOSITORY)
    private readonly caseRecordRepository: ICaseRecordRepository,
  ) {}

  async execute(params: {
    idCase: number;
    page?: number;
    pageSize?: number;
  }): Promise<
    CaseDocumentsPaginatedResult<CaseDocumentsWithRelations>
  > {
    const caseRecord = await this.caseRecordRepository.findById(params.idCase);
    if (!caseRecord) {
      throw new Error('CASE_NOT_FOUND');
    }

    const query: CaseDocumentsListQuery = {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      idCase: params.idCase,
    };
    return this.caseDocumentsRepository.findPaginated(query);
  }
}
