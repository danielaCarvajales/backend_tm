import { Inject, Injectable } from '@nestjs/common';
import { CaseDocuments } from '../../../domain/entities/case-documents.entity';
import {
  ICaseDocumentsRepository,
  CaseDocumentsWithRelations,
} from '../../../domain/repositories/case-documents.repository';
import { IDocumentRepository } from '../../../domain/repositories/document.repository';
import { UpdateCaseDocumentsDto } from '../../dto/case-documents/update-case-documents.dto';
import { CASE_DOCUMENTS_REPOSITORY } from '../../tokens/case-documents.repository.token';
import { DOCUMENT_REPOSITORY } from '../../tokens/document.repository.token';

@Injectable()
export class UpdateCaseDocumentsUseCase {
  constructor(
    @Inject(CASE_DOCUMENTS_REPOSITORY)
    private readonly repository: ICaseDocumentsRepository,
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: IDocumentRepository,
  ) {}

  async execute(
    idCaseDocuments: number,
    dto: UpdateCaseDocumentsDto,
  ): Promise<CaseDocumentsWithRelations> {
    const existing = await this.repository.findByIdWithRelations(
      idCaseDocuments,
    );
    if (!existing) {
      throw new Error('CASE_DOCUMENTS_NOT_FOUND');
    }

    const document = await this.documentRepository.findById(dto.idDocument);
    if (!document) {
      throw new Error('DOCUMENT_NOT_FOUND');
    }

    if (dto.idDocument !== existing.idDocument) {
      const duplicate = await this.repository.findByCaseAndDocument(
        existing.idCase,
        dto.idDocument,
      );
      if (
        duplicate &&
        duplicate.idCaseDocuments !== idCaseDocuments
      ) {
        throw new Error('CASE_DOCUMENTS_DUPLICATE');
      }
    }

    const entity = new CaseDocuments(
      idCaseDocuments,
      existing.idCase,
      dto.idDocument,
    );
    await this.repository.update(entity);

    const updated = await this.repository.findByIdWithRelations(
      idCaseDocuments,
    );
    if (!updated) {
      throw new Error('CASE_DOCUMENTS_NOT_FOUND');
    }
    return updated;
  }
}
