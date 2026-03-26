import { Module } from '@nestjs/common';
import { TYPE_DOCUMENT_REPOSITORY } from '../application/tokens/type-document.repository.token';
import { CreateTypeDocumentUseCase } from '../application/use-cases/type-document/create-type-document.use-case';
import { DeleteTypeDocumentUseCase } from '../application/use-cases/type-document/delete-type-document.use-case';
import { GetTypeDocumentByIdUseCase } from '../application/use-cases/type-document/get-type-document-by-id.use-case';
import { ListTypeDocumentsUseCase } from '../application/use-cases/type-document/list-type-documents.use-case';
import { UpdateTypeDocumentUseCase } from '../application/use-cases/type-document/update-type-document.use-case';
import { TypeDocumentController } from './controllers/type-document.controller';
import { TypeDocumentTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/type-document.repository';

@Module({
  controllers: [TypeDocumentController],
  providers: [
    {
      provide: TYPE_DOCUMENT_REPOSITORY,
      useClass: TypeDocumentTypeOrmRepository,
    },
    CreateTypeDocumentUseCase,
    UpdateTypeDocumentUseCase,
    DeleteTypeDocumentUseCase,
    GetTypeDocumentByIdUseCase,
    ListTypeDocumentsUseCase,
  ],
  exports: [TYPE_DOCUMENT_REPOSITORY],
})
export class TypeDocumentModule {}
