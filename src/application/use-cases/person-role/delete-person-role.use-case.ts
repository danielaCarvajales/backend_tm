import { Inject, Injectable } from '@nestjs/common';
import { IPersonRoleRepository } from '../../../domain/repositories/person-role.repository';
import { PERSON_ROLE_REPOSITORY } from '../../tokens/person-role.repository.token';

@Injectable()
export class DeletePersonRoleUseCase {
  constructor(
    @Inject(PERSON_ROLE_REPOSITORY)
    private readonly repository: IPersonRoleRepository,
  ) {}

  async execute(idPersonRole: number): Promise<void> {
    const existing = await this.repository.findById(idPersonRole);
    if (!existing) {
      throw new Error('PERSON_ROLE_NOT_FOUND');
    }
    await this.repository.delete(idPersonRole);
  }
}
