import { Inject, Injectable } from '@nestjs/common';
import { PersonRole } from '../../../domain/entities/person-role.entity';
import { IPersonRoleRepository } from '../../../domain/repositories/person-role.repository';
import { PERSON_ROLE_REPOSITORY } from '../../tokens/person-role.repository.token';
import { AuthContext, ensureCompanyAccess } from '../../auth/auth-context';

@Injectable()
export class GetPersonRoleByIdUseCase {
  constructor(
    @Inject(PERSON_ROLE_REPOSITORY)
    private readonly repository: IPersonRoleRepository,
  ) {}

  async execute(idPersonRole: number, authContext?: AuthContext): Promise<PersonRole | null> {
    const personRole = await this.repository.findById(idPersonRole);
    if (!personRole) {
      return null;
    }
    if (authContext) {
      ensureCompanyAccess(authContext, personRole.codeCompany);
    }
    return personRole;
  }
}
