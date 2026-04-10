import { Inject, Injectable } from '@nestjs/common';
import {
  IPersonRepository,
  PersonWithRelations,
} from '../../../domain/repositories/person.repository';
import { PERSON_REPOSITORY } from '../../tokens/person.repository.token';
import { AuthContext, ensureCanManageCompanyUsers } from '../../auth/auth-context';

@Injectable()
export class GetPersonByIdUseCase {
  constructor(
    @Inject(PERSON_REPOSITORY)
    private readonly repository: IPersonRepository,
  ) {}

  async execute(
    idPerson: number,
    authContext?: AuthContext,
  ): Promise<PersonWithRelations | null> {
    if (authContext) {
      ensureCanManageCompanyUsers(authContext);
    }
    const scopedCompanyId = authContext ? authContext.companyId : undefined;
    return this.repository.findByIdWithRelations(idPerson, scopedCompanyId);
  }
}
