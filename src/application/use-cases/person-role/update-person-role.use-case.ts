import { Inject, Injectable } from '@nestjs/common';
import { PersonRole } from '../../../domain/entities/person-role.entity';
import { IPersonRoleRepository } from '../../../domain/repositories/person-role.repository';
import { UpdatePersonRoleDto } from '../../dto/person-role/update-person-role.dto';
import { PERSON_ROLE_REPOSITORY } from '../../tokens/person-role.repository.token';

@Injectable()
export class UpdatePersonRoleUseCase {
  constructor(
    @Inject(PERSON_ROLE_REPOSITORY)
    private readonly repository: IPersonRoleRepository,
  ) {}

  async execute(idPersonRole: number, dto: UpdatePersonRoleDto): Promise<PersonRole> {
    const existing = await this.repository.findById(idPersonRole);
    if (!existing) {
      throw new Error('PERSON_ROLE_NOT_FOUND');
    }
    const updated = new PersonRole(
      idPersonRole,
      dto.idPerson ?? existing.idPerson,
      dto.idRole ?? existing.idRole,
      dto.codeCompany ?? existing.codeCompany,
      dto.idState ?? existing.idState,
      existing.assignmentDate,
      dto.revocationDate !== undefined
        ? (dto.revocationDate ? new Date(dto.revocationDate) : null)
        : existing.revocationDate,
    );
    return this.repository.update(updated);
  }
}
