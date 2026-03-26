import { Inject, Injectable } from '@nestjs/common';
import { Role } from '../../../domain/entities/role.entity';
import { IRoleRepository } from '../../../domain/repositories/role.repository';
import { CreateRoleDto } from '../../dto/role/create-role.dto';
import { ROLE_REPOSITORY } from '../../tokens/role.repository.token';

@Injectable()
export class CreateRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly repository: IRoleRepository,
  ) {}

  async execute(dto: CreateRoleDto): Promise<Role> {
    const entity = new Role(undefined, dto.name);
    return this.repository.save(entity);
  }
}
