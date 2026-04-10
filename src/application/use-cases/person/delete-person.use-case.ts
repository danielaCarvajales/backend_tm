import { Inject, Injectable } from '@nestjs/common';
import { IPersonRepository } from '../../../domain/repositories/person.repository';
import { PERSON_REPOSITORY } from '../../tokens/person.repository.token';
import { AuthContext, ensureCanManageCompanyUsers } from '../../auth/auth-context';

@Injectable()
export class DeletePersonUseCase {
  constructor(
    @Inject(PERSON_REPOSITORY)
    private readonly repository: IPersonRepository,
  ) {}

  async execute(idPerson: number, authContext?: AuthContext): Promise<void> {
    if (authContext) {
      ensureCanManageCompanyUsers(authContext);
    }
    const scopedCompanyId = authContext ? authContext.companyId : undefined;
    const existing = await this.repository.findById(idPerson, scopedCompanyId);
    if (!existing) {
      throw new Error('PERSON_NOT_FOUND');
    }
    await this.repository.delete(idPerson, scopedCompanyId);
  }
}
