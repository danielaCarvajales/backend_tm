import { Inject, Injectable } from '@nestjs/common';
import { CaseDocuments } from '../../../domain/entities/case-documents.entity';
import { ICaseDocumentsRepository, CaseDocumentsWithRelations } from '../../../domain/repositories/case-documents.repository';
import { ICaseRecordRepository } from '../../../domain/repositories/case-record.repository';
import { IDocumentRepository } from '../../../domain/repositories/document.repository';
import { CreateCaseDocumentsDto } from '../../dto/case-documents/create-case-documents.dto';
import { CASE_DOCUMENTS_REPOSITORY } from '../../tokens/case-documents.repository.token';
import { CASE_RECORD_REPOSITORY } from '../../tokens/case-record.repository.token';
import { DOCUMENT_REPOSITORY } from '../../tokens/document.repository.token';

@Injectable()
export class CreateCaseDocumentsUseCase {
  constructor(
    @Inject(CASE_DOCUMENTS_REPOSITORY)
    private readonly repository: ICaseDocumentsRepository,
    @Inject(CASE_RECORD_REPOSITORY)
    private readonly caseRecordRepository: ICaseRecordRepository,
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: IDocumentRepository,
  ) {}

  async execute(dto: CreateCaseDocumentsDto): Promise<CaseDocumentsWithRelations> {
    const caseRecord = await this.caseRecordRepository.findById(dto.idCase);
    if (!caseRecord) {
      throw new Error('CASE_NOT_FOUND');
    }

    const document = await this.documentRepository.findById(dto.idDocument);
    if (!document) {
      throw new Error('DOCUMENT_NOT_FOUND');
    }

    const duplicate = await this.repository.findByCaseAndDocument(
      dto.idCase,
      dto.idDocument,
    );
    if (duplicate) {
      throw new Error('CASE_DOCUMENTS_DUPLICATE');
    }

    const entity = new CaseDocuments(undefined, dto.idCase, dto.idDocument);
    const saved = await this.repository.save(entity);

    const withRelations = await this.repository.findByIdWithRelations(
      saved.idCaseDocuments!,
    );
    if (!withRelations) {
      throw new Error('CASE_DOCUMENTS_NOT_FOUND');
    }
    return withRelations;
  }
}
