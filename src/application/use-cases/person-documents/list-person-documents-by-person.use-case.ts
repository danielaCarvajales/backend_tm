import { Inject, Injectable } from '@nestjs/common';
import {
  IPersonDocumentsRepository,
  PersonDocumentsListQuery,
  PersonDocumentsPaginatedResult,
  PersonDocumentsWithRelations,
} from '../../../domain/repositories/person-documents.repository';
import { IPersonRepository } from '../../../domain/repositories/person.repository';
import { PERSON_DOCUMENTS_REPOSITORY } from '../../tokens/person-documents.repository.token';
import { PERSON_REPOSITORY } from '../../tokens/person.repository.token';

@Injectable()
export class ListPersonDocumentsByPersonUseCase {
  constructor(
    @Inject(PERSON_DOCUMENTS_REPOSITORY)
    private readonly personDocumentsRepository: IPersonDocumentsRepository,
    @Inject(PERSON_REPOSITORY)
    private readonly personRepository: IPersonRepository,
  ) {}

  async execute(params: {
    idPerson: number;
    page?: number;
    pageSize?: number;
  }): Promise<
    PersonDocumentsPaginatedResult<PersonDocumentsWithRelations>
  > {
    const person = await this.personRepository.findById(params.idPerson);
    if (!person) {
      throw new Error('PERSON_NOT_FOUND');
    }

    const query: PersonDocumentsListQuery = {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      idPerson: params.idPerson,
    };
    return this.personDocumentsRepository.findPaginated(query);
  }
}
