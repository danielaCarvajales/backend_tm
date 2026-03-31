import { Inject, Injectable } from '@nestjs/common';
import { PersonDocuments } from '../../../domain/entities/person-documents.entity';
import { IDocumentRepository } from '../../../domain/repositories/document.repository';
import {
  IPersonDocumentsRepository,
  PersonDocumentsWithRelations,
} from '../../../domain/repositories/person-documents.repository';
import { UpdatePersonDocumentsDto } from '../../dto/person-documents/update-person-documents.dto';
import { DOCUMENT_REPOSITORY } from '../../tokens/document.repository.token';
import { PERSON_DOCUMENTS_REPOSITORY } from '../../tokens/person-documents.repository.token';

@Injectable()
export class UpdatePersonDocumentsUseCase {
  constructor(
    @Inject(PERSON_DOCUMENTS_REPOSITORY)
    private readonly repository: IPersonDocumentsRepository,
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: IDocumentRepository,
  ) {}

  async execute(
    idPersonDocuments: number,
    dto: UpdatePersonDocumentsDto,
  ): Promise<PersonDocumentsWithRelations> {
    const existing = await this.repository.findByIdWithRelations(
      idPersonDocuments,
    );
    if (!existing) {
      throw new Error('PERSON_DOCUMENTS_NOT_FOUND');
    }

    const document = await this.documentRepository.findById(dto.idDocument);
    if (!document) {
      throw new Error('DOCUMENT_NOT_FOUND');
    }

    if (dto.idDocument !== existing.idDocument) {
      const duplicate = await this.repository.findByPersonAndDocument(
        existing.idPerson,
        dto.idDocument,
      );
      if (
        duplicate &&
        duplicate.idPersonDocuments !== idPersonDocuments
      ) {
        throw new Error('PERSON_DOCUMENTS_DUPLICATE');
      }
    }

    const entity = new PersonDocuments(
      idPersonDocuments,
      existing.idPerson,
      dto.idDocument,
    );
    await this.repository.update(entity);

    const updated = await this.repository.findByIdWithRelations(
      idPersonDocuments,
    );
    if (!updated) {
      throw new Error('PERSON_DOCUMENTS_NOT_FOUND');
    }
    return updated;
  }
}
