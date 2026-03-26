import { Inject, Injectable } from '@nestjs/common';
import { Role } from '../../../domain/entities/role.entity';
import { IRoleRepository } from '../../../domain/repositories/role.repository';
import { ROLE_REPOSITORY } from '../../tokens/role.repository.token';

@Injectable()
export class GetRoleByIdUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly repository: IRoleRepository,
  ) {}

  async execute(idRole: number): Promise<Role | null> {
    return this.repository.findById(idRole);
  }
}
