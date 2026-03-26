import { Inject, Injectable } from '@nestjs/common';
import { Role } from '../../../domain/entities/role.entity';
import { IRoleRepository } from '../../../domain/repositories/role.repository';
import { UpdateRoleDto } from '../../dto/role/update-role.dto';
import { ROLE_REPOSITORY } from '../../tokens/role.repository.token';

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly repository: IRoleRepository,
  ) {}

  async execute(idRole: number, dto: UpdateRoleDto): Promise<Role> {
    const existing = await this.repository.findById(idRole);
    if (!existing) {
      throw new Error('ROLE_NOT_FOUND');
    }
    const updated = new Role(idRole, dto.name ?? existing.name);
    return this.repository.update(updated);
  }
}
