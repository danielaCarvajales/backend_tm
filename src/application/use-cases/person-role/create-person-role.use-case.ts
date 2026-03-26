import { Inject, Injectable } from '@nestjs/common';
import { PersonRole } from '../../../domain/entities/person-role.entity';
import { IPersonRoleRepository } from '../../../domain/repositories/person-role.repository';
import { CreatePersonRoleDto } from '../../dto/person-role/create-person-role.dto';
import { PERSON_ROLE_REPOSITORY } from '../../tokens/person-role.repository.token';
import { nowColombia } from '../../../infrastructure/utils/date.util';

@Injectable()
export class CreatePersonRoleUseCase {
  constructor(
    @Inject(PERSON_ROLE_REPOSITORY)
    private readonly repository: IPersonRoleRepository,
  ) {}

  async execute(dto: CreatePersonRoleDto): Promise<PersonRole> {
    const entity = new PersonRole(
      undefined,
      dto.idPerson,
      dto.idRole,
      dto.codeCompany,
      dto.idState ?? 1,
      nowColombia(),
      null,
    );
    return this.repository.save(entity);
  }
}
