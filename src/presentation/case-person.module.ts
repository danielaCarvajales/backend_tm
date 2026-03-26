import { Module } from '@nestjs/common';
import { CASE_PERSON_REPOSITORY } from '../application/tokens/case-person.repository.token';
import { CreateCasePersonUseCase } from '../application/use-cases/case-person/create-case-person.use-case';
import { DeleteCasePersonUseCase } from '../application/use-cases/case-person/delete-case-person.use-case';
import { GetCasePersonByIdUseCase } from '../application/use-cases/case-person/get-case-person-by-id.use-case';
import { ListCasePersonsUseCase } from '../application/use-cases/case-person/list-case-persons.use-case';
import { ResolveCaseIdForCasePersonUseCase } from '../application/use-cases/case-person/resolve-case-id-for-case-person.use-case';
import { UpdateCasePersonUseCase } from '../application/use-cases/case-person/update-case-person.use-case';
import { CasePersonController } from './controllers/case-person.controller';
import { CasePersonTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/case-person.repository';
import { CaseRecordModule } from './case-record.module';
import { FamilyRelationshipModule } from './family-relationship.module';
import { PersonModule } from './person.module';

@Module({
  imports: [CaseRecordModule, FamilyRelationshipModule, PersonModule],
  controllers: [CasePersonController],
  providers: [
    {
      provide: CASE_PERSON_REPOSITORY,
      useClass: CasePersonTypeOrmRepository,
    },
    CreateCasePersonUseCase,
    ResolveCaseIdForCasePersonUseCase,
    UpdateCasePersonUseCase,
    DeleteCasePersonUseCase,
    GetCasePersonByIdUseCase,
    ListCasePersonsUseCase,
  ],
  exports: [CASE_PERSON_REPOSITORY],
})
export class CasePersonModule {}
