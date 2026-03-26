import { Module } from '@nestjs/common';
import { ROLE_REPOSITORY } from '../application/tokens/role.repository.token';
import { CreateRoleUseCase } from '../application/use-cases/role/create-role.use-case';
import { DeleteRoleUseCase } from '../application/use-cases/role/delete-role.use-case';
import { GetRoleByIdUseCase } from '../application/use-cases/role/get-role-by-id.use-case';
import { ListRolesUseCase } from '../application/use-cases/role/list-roles.use-case';
import { UpdateRoleUseCase } from '../application/use-cases/role/update-role.use-case';
import { RoleController } from './controllers/role.controller';
import { RoleTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/role.repository';

@Module({
  controllers: [RoleController],
  providers: [
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleTypeOrmRepository,
    },
    CreateRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    GetRoleByIdUseCase,
    ListRolesUseCase,
  ],
})
export class RoleModule {}
