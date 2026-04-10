import { Module } from '@nestjs/common';
import { PERSON_ROLE_REPOSITORY } from '../application/tokens/person-role.repository.token';
import { ROLE_REPOSITORY } from '../application/tokens/role.repository.token';
import { PERSON_REPOSITORY } from '../application/tokens/person.repository.token';
import { CreatePersonRoleUseCase } from '../application/use-cases/person-role/create-person-role.use-case';
import { DeletePersonRoleUseCase } from '../application/use-cases/person-role/delete-person-role.use-case';
import { GetPersonRoleByIdUseCase } from '../application/use-cases/person-role/get-person-role-by-id.use-case';
import { ListPersonRolesUseCase } from '../application/use-cases/person-role/list-person-roles.use-case';
import { UpdatePersonRoleUseCase } from '../application/use-cases/person-role/update-person-role.use-case';
import { PersonRoleController } from './controllers/person-role.controller';
import { PersonRoleTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/person-role.repository';
import { RoleTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/role.repository';
import { PersonTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/person.repository';

@Module({
  controllers: [PersonRoleController],
  providers: [
    {
      provide: PERSON_ROLE_REPOSITORY,
      useClass: PersonRoleTypeOrmRepository,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleTypeOrmRepository,
    },
    {
      provide: PERSON_REPOSITORY,
      useClass: PersonTypeOrmRepository,
    },
    CreatePersonRoleUseCase,
    UpdatePersonRoleUseCase,
    DeletePersonRoleUseCase,
    GetPersonRoleByIdUseCase,
    ListPersonRolesUseCase,
  ],
  exports: [
    PERSON_ROLE_REPOSITORY,
    ROLE_REPOSITORY,
    CreatePersonRoleUseCase,
  ],
})
export class PersonRoleModule {}
