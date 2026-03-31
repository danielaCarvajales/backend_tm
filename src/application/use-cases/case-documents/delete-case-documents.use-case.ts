import { Inject, Injectable } from '@nestjs/common';
import { ICaseDocumentsRepository } from '../../../domain/repositories/case-documents.repository';
import { CASE_DOCUMENTS_REPOSITORY } from '../../tokens/case-documents.repository.token';

@Injectable()
export class DeleteCaseDocumentsUseCase {
  constructor(
    @Inject(CASE_DOCUMENTS_REPOSITORY)
    private readonly repository: ICaseDocumentsRepository,
  ) {}

  async execute(idCaseDocuments: number): Promise<void> {
    const existing = await this.repository.findByIdWithRelations(
      idCaseDocuments,
    );
    if (!existing) {
      throw new Error('CASE_DOCUMENTS_NOT_FOUND');
    }
    await this.repository.delete(idCaseDocuments);
  }
}
