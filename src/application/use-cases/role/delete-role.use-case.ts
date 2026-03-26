import { Inject, Injectable } from '@nestjs/common';
import { IRoleRepository } from '../../../domain/repositories/role.repository';
import { ROLE_REPOSITORY } from '../../tokens/role.repository.token';

@Injectable()
export class DeleteRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly repository: IRoleRepository,
  ) {}

  async execute(idRole: number): Promise<void> {
    const existing = await this.repository.findById(idRole);
    if (!existing) {
      throw new Error('ROLE_NOT_FOUND');
    }
    await this.repository.delete(idRole);
  }
}
