import { Module } from '@nestjs/common';
import { PERSON_ROLE_REPOSITORY } from '../application/tokens/person-role.repository.token';
import { CreatePersonRoleUseCase } from '../application/use-cases/person-role/create-person-role.use-case';
import { DeletePersonRoleUseCase } from '../application/use-cases/person-role/delete-person-role.use-case';
import { GetPersonRoleByIdUseCase } from '../application/use-cases/person-role/get-person-role-by-id.use-case';
import { ListPersonRolesUseCase } from '../application/use-cases/person-role/list-person-roles.use-case';
import { UpdatePersonRoleUseCase } from '../application/use-cases/person-role/update-person-role.use-case';
import { PersonRoleController } from './controllers/person-role.controller';
import { PersonRoleTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/person-role.repository';

@Module({
  controllers: [PersonRoleController],
  providers: [
    {
      provide: PERSON_ROLE_REPOSITORY,
      useClass: PersonRoleTypeOrmRepository,
    },
    CreatePersonRoleUseCase,
    UpdatePersonRoleUseCase,
    DeletePersonRoleUseCase,
    GetPersonRoleByIdUseCase,
    ListPersonRolesUseCase,
  ],
  exports: [PERSON_ROLE_REPOSITORY],
})
export class PersonRoleModule {}
