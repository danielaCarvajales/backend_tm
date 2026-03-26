import { Inject, Injectable } from '@nestjs/common';
import { PersonRole } from '../../../domain/entities/person-role.entity';
import { IPersonRoleRepository } from '../../../domain/repositories/person-role.repository';
import { PERSON_ROLE_REPOSITORY } from '../../tokens/person-role.repository.token';

@Injectable()
export class GetPersonRoleByIdUseCase {
  constructor(
    @Inject(PERSON_ROLE_REPOSITORY)
    private readonly repository: IPersonRoleRepository,
  ) {}

  async execute(idPersonRole: number): Promise<PersonRole | null> {
    return this.repository.findById(idPersonRole);
  }
}
