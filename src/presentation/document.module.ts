import { Module } from '@nestjs/common';
import { DOCUMENT_REPOSITORY } from '../application/tokens/document.repository.token';
import { FILE_STORAGE_PORT } from '../application/tokens/file-storage.port.token';
import { CreateDocumentUseCase } from '../application/use-cases/document/create-document.use-case';
import { DeleteDocumentUseCase } from '../application/use-cases/document/delete-document.use-case';
import { DownloadDocumentFileUseCase } from '../application/use-cases/document/download-document-file.use-case';
import { GetDocumentByIdUseCase } from '../application/use-cases/document/get-document-by-id.use-case';
import { ListDocumentsUseCase } from '../application/use-cases/document/list-documents.use-case';
import { UpdateDocumentUseCase } from '../application/use-cases/document/update-document.use-case';
import { DocumentTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/document.repository';
import { SpacesFileStorageService } from '../infrastructure/storage/spaces-file-storage.service';
import { DocumentController } from './controllers/document.controller';

@Module({
  controllers: [DocumentController],
  providers: [
    {
      provide: DOCUMENT_REPOSITORY,
      useClass: DocumentTypeOrmRepository,
    },
    {
      provide: FILE_STORAGE_PORT,
      useClass: SpacesFileStorageService,
    },
    CreateDocumentUseCase,
    UpdateDocumentUseCase,
    DeleteDocumentUseCase,
    DownloadDocumentFileUseCase,
    GetDocumentByIdUseCase,
    ListDocumentsUseCase,
  ],
  exports: [DOCUMENT_REPOSITORY],
})
export class DocumentModule {}
