import { Inject, Injectable } from '@nestjs/common';
import {
  IPersonDocumentsRepository,
  PersonDocumentsWithRelations,
} from '../../../domain/repositories/person-documents.repository';
import { PERSON_DOCUMENTS_REPOSITORY } from '../../tokens/person-documents.repository.token';

@Injectable()
export class GetPersonDocumentsByIdUseCase {
  constructor(
    @Inject(PERSON_DOCUMENTS_REPOSITORY)
    private readonly repository: IPersonDocumentsRepository,
  ) {}

  async execute(
    idPersonDocuments: number,
  ): Promise<PersonDocumentsWithRelations | null> {
    return this.repository.findByIdWithRelations(idPersonDocuments);
  }
}
