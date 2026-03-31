import { Inject, Injectable } from '@nestjs/common';
import { IPersonDocumentsRepository } from '../../../domain/repositories/person-documents.repository';
import { PERSON_DOCUMENTS_REPOSITORY } from '../../tokens/person-documents.repository.token';

@Injectable()
export class DeletePersonDocumentsUseCase {
  constructor(
    @Inject(PERSON_DOCUMENTS_REPOSITORY)
    private readonly repository: IPersonDocumentsRepository,
  ) {}

  async execute(idPersonDocuments: number): Promise<void> {
    const existing = await this.repository.findByIdWithRelations(
      idPersonDocuments,
    );
    if (!existing) {
      throw new Error('PERSON_DOCUMENTS_NOT_FOUND');
    }
    await this.repository.delete(idPersonDocuments);
  }
}
