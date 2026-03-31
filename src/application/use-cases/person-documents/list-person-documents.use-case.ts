import { Inject, Injectable } from '@nestjs/common';
import {
  IPersonDocumentsRepository,
  PersonDocumentsListQuery,
  PersonDocumentsPaginatedResult,
  PersonDocumentsWithRelations,
} from '../../../domain/repositories/person-documents.repository';
import { QueryPersonDocumentsDto } from '../../dto/person-documents/query-person-documents.dto';
import { PERSON_DOCUMENTS_REPOSITORY } from '../../tokens/person-documents.repository.token';

@Injectable()
export class ListPersonDocumentsUseCase {
  constructor(
    @Inject(PERSON_DOCUMENTS_REPOSITORY)
    private readonly repository: IPersonDocumentsRepository,
  ) {}

  async execute(
    query: QueryPersonDocumentsDto,
  ): Promise<
    PersonDocumentsPaginatedResult<PersonDocumentsWithRelations>
  > {
    const domainQuery: PersonDocumentsListQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      idPerson: query.idPerson,
    };
    return this.repository.findPaginated(domainQuery);
  }
}
