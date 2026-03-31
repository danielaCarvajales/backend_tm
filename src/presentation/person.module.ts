import { Module } from '@nestjs/common';
import { PersonService } from '../domain/services/person.service';
import { PERSON_REPOSITORY } from '../application/tokens/person.repository.token';
import { CreatePersonUseCase } from '../application/use-cases/person/create-person.use-case';
import { DeletePersonUseCase } from '../application/use-cases/person/delete-person.use-case';
import { GetPersonByIdUseCase } from '../application/use-cases/person/get-person-by-id.use-case';
import { ListPersonsUseCase } from '../application/use-cases/person/list-persons.use-case';
import { UpdatePersonUseCase } from '../application/use-cases/person/update-person.use-case';
import { PersonController } from './controllers/person.controller';
import { PersonTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/person.repository';

@Module({
  controllers: [PersonController],
  providers: [
    PersonService,
    {
      provide: PERSON_REPOSITORY,
      useClass: PersonTypeOrmRepository,
    },
    CreatePersonUseCase,
    UpdatePersonUseCase,
    DeletePersonUseCase,
    GetPersonByIdUseCase,
    ListPersonsUseCase,
  ],
  exports: [PERSON_REPOSITORY, PersonService],
})
export class PersonModule {}
