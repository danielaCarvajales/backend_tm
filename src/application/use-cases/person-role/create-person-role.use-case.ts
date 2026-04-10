import { Inject, Injectable } from '@nestjs/common';
import { PersonRole } from '../../../domain/entities/person-role.entity';
import { IPersonRoleRepository } from '../../../domain/repositories/person-role.repository';
import { IRoleRepository } from '../../../domain/repositories/role.repository';
import { IPersonRepository } from '../../../domain/repositories/person.repository';
import { CreatePersonRoleDto } from '../../dto/person-role/create-person-role.dto';
import { PERSON_ROLE_REPOSITORY } from '../../tokens/person-role.repository.token';
import { ROLE_REPOSITORY } from '../../tokens/role.repository.token';
import { PERSON_REPOSITORY } from '../../tokens/person.repository.token';
import { nowColombia } from '../../../infrastructure/utils/date.util';
import {
  AuthContext,
  ensureCanManageCompanyUsers,
} from '../../auth/auth-context';

@Injectable()
export class CreatePersonRoleUseCase {
  private static readonly ROLE_SUPER_ADMIN = 'super_admin';
  private static readonly ROLE_ADMIN = 'administrador';

  constructor(
    @Inject(PERSON_ROLE_REPOSITORY)
    private readonly repository: IPersonRoleRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roles: IRoleRepository,
    @Inject(PERSON_REPOSITORY)
    private readonly persons: IPersonRepository,
  ) {}

  async execute(dto: CreatePersonRoleDto, authContext: AuthContext): Promise<PersonRole> {
    ensureCanManageCompanyUsers(authContext);
    const codeCompany = authContext.companyId;
    const role = await this.roles.findById(dto.idRole);
    if (!role) {
      throw new Error('ROLE_NOT_FOUND');
    }
    const roleName = role.name.trim().toLowerCase();
    if (roleName === CreatePersonRoleUseCase.ROLE_SUPER_ADMIN) {
      throw new Error('SUPER_ADMIN_ASSIGNMENT_BLOCKED');
    }
    if (roleName === CreatePersonRoleUseCase.ROLE_ADMIN) {
      throw new Error('FORBIDDEN_ROLE_SCOPE');
    }
    const person = await this.persons.findById(dto.idPerson, codeCompany);
    if (!person) {
      throw new Error('PERSON_NOT_FOUND');
    }
    const entity = new PersonRole(
      undefined,
      dto.idPerson,
      dto.idRole,
      codeCompany,
      dto.idState ?? 1,
      nowColombia(),
      null,
    );
    return this.repository.save(entity);
  }
}
