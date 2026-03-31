import { Inject, Injectable } from '@nestjs/common';
import {
  ICaseDocumentsRepository,
  CaseDocumentsWithRelations,
} from '../../../domain/repositories/case-documents.repository';
import { CASE_DOCUMENTS_REPOSITORY } from '../../tokens/case-documents.repository.token';

@Injectable()
export class GetCaseDocumentsByIdUseCase {
  constructor(
    @Inject(CASE_DOCUMENTS_REPOSITORY)
    private readonly repository: ICaseDocumentsRepository,
  ) {}

  async execute(
    idCaseDocuments: number,
  ): Promise<CaseDocumentsWithRelations | null> {
    return this.repository.findByIdWithRelations(idCaseDocuments);
  }
}
