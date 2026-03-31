import { Module } from '@nestjs/common';
import { PERSON_DOCUMENTS_REPOSITORY } from '../application/tokens/person-documents.repository.token';
import { CreatePersonDocumentsUseCase } from '../application/use-cases/person-documents/create-person-documents.use-case';
import { DeletePersonDocumentsUseCase } from '../application/use-cases/person-documents/delete-person-documents.use-case';
import { GetPersonDocumentsByIdUseCase } from '../application/use-cases/person-documents/get-person-documents-by-id.use-case';
import { ListPersonDocumentsByPersonUseCase } from '../application/use-cases/person-documents/list-person-documents-by-person.use-case';
import { ListPersonDocumentsUseCase } from '../application/use-cases/person-documents/list-person-documents.use-case';
import { UpdatePersonDocumentsUseCase } from '../application/use-cases/person-documents/update-person-documents.use-case';
import { PersonDocumentsTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/person-documents.repository';
import { PersonDocumentsController } from './controllers/person-documents.controller';
import { DocumentModule } from './document.module';
import { PersonModule } from './person.module';

@Module({
  imports: [PersonModule, DocumentModule],
  controllers: [PersonDocumentsController],
  providers: [
    {
      provide: PERSON_DOCUMENTS_REPOSITORY,
      useClass: PersonDocumentsTypeOrmRepository,
    },
    CreatePersonDocumentsUseCase,
    UpdatePersonDocumentsUseCase,
    DeletePersonDocumentsUseCase,
    GetPersonDocumentsByIdUseCase,
    ListPersonDocumentsUseCase,
    ListPersonDocumentsByPersonUseCase,
  ],
  exports: [PERSON_DOCUMENTS_REPOSITORY],
})
export class PersonDocumentsModule {}
