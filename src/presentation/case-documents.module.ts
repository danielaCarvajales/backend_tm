import { Module } from '@nestjs/common';
import { CASE_DOCUMENTS_REPOSITORY } from '../application/tokens/case-documents.repository.token';
import { CreateCaseDocumentsUseCase } from '../application/use-cases/case-documents/create-case-documents.use-case';
import { DeleteCaseDocumentsUseCase } from '../application/use-cases/case-documents/delete-case-documents.use-case';
import { GetCaseDocumentsByIdUseCase } from '../application/use-cases/case-documents/get-case-documents-by-id.use-case';
import { ListCaseDocumentsByCaseUseCase } from '../application/use-cases/case-documents/list-case-documents-by-case.use-case';
import { ListCaseDocumentsUseCase } from '../application/use-cases/case-documents/list-case-documents.use-case';
import { UpdateCaseDocumentsUseCase } from '../application/use-cases/case-documents/update-case-documents.use-case';
import { CaseDocumentsTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/case-documents.repository';
import { CaseRecordModule } from './case-record.module';
import { CaseDocumentsController } from './controllers/case-documents.controller';
import { DocumentModule } from './document.module';

@Module({
  imports: [CaseRecordModule, DocumentModule],
  controllers: [CaseDocumentsController],
  providers: [
    {
      provide: CASE_DOCUMENTS_REPOSITORY,
      useClass: CaseDocumentsTypeOrmRepository,
    },
    CreateCaseDocumentsUseCase,
    UpdateCaseDocumentsUseCase,
    DeleteCaseDocumentsUseCase,
    GetCaseDocumentsByIdUseCase,
    ListCaseDocumentsUseCase,
    ListCaseDocumentsByCaseUseCase,
  ],
  exports: [CASE_DOCUMENTS_REPOSITORY],
})
export class CaseDocumentsModule {}
