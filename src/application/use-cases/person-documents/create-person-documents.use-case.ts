import { Inject, Injectable } from '@nestjs/common';
import { PersonDocuments } from '../../../domain/entities/person-documents.entity';
import { IDocumentRepository } from '../../../domain/repositories/document.repository';
import {
  IPersonDocumentsRepository,
  PersonDocumentsWithRelations,
} from '../../../domain/repositories/person-documents.repository';
import { IPersonRepository } from '../../../domain/repositories/person.repository';
import { CreatePersonDocumentsDto } from '../../dto/person-documents/create-person-documents.dto';
import { DOCUMENT_REPOSITORY } from '../../tokens/document.repository.token';
import { PERSON_DOCUMENTS_REPOSITORY } from '../../tokens/person-documents.repository.token';
import { PERSON_REPOSITORY } from '../../tokens/person.repository.token';

@Injectable()
export class CreatePersonDocumentsUseCase {
  constructor(
    @Inject(PERSON_DOCUMENTS_REPOSITORY)
    private readonly repository: IPersonDocumentsRepository,
    @Inject(PERSON_REPOSITORY)
    private readonly personRepository: IPersonRepository,
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: IDocumentRepository,
  ) {}

  async execute(dto: CreatePersonDocumentsDto): Promise<PersonDocumentsWithRelations> {
    const person = await this.personRepository.findById(dto.idPerson);
    if (!person) {
      throw new Error('PERSON_NOT_FOUND');
    }

    const document = await this.documentRepository.findById(dto.idDocument);
    if (!document) {
      throw new Error('DOCUMENT_NOT_FOUND');
    }

    const duplicate = await this.repository.findByPersonAndDocument(
      dto.idPerson,
      dto.idDocument,
    );
    if (duplicate) {
      throw new Error('PERSON_DOCUMENTS_DUPLICATE');
    }

    const entity = new PersonDocuments(undefined, dto.idPerson, dto.idDocument);
    const saved = await this.repository.save(entity);

    const withRelations = await this.repository.findByIdWithRelations(
      saved.idPersonDocuments!,
    );
    if (!withRelations) {
      throw new Error('PERSON_DOCUMENTS_NOT_FOUND');
    }
    return withRelations;
  }
}
