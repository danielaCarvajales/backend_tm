import { Module } from '@nestjs/common';
import { IDENTITY_DOCUMENT_TYPE_REPOSITORY } from '../application/tokens/identity-document-type.repository.token';
import { CreateIdentityDocumentTypeUseCase } from '../application/use-cases/identity-document-type/create-identity-document-type.use-case';
import { DeleteIdentityDocumentTypeUseCase } from '../application/use-cases/identity-document-type/delete-identity-document-type.use-case';
import { GetIdentityDocumentTypeByIdUseCase } from '../application/use-cases/identity-document-type/get-identity-document-type-by-id.use-case';
import { ListIdentityDocumentTypesUseCase } from '../application/use-cases/identity-document-type/list-identity-document-types.use-case';
import { UpdateIdentityDocumentTypeUseCase } from '../application/use-cases/identity-document-type/update-identity-document-type.use-case';
import { IdentityDocumentTypeController } from './controllers/identity-document-type.controller';
import { IdentityDocumentTypeTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/identity-document-type.repository';

@Module({
  controllers: [IdentityDocumentTypeController],
  providers: [
    {
      provide: IDENTITY_DOCUMENT_TYPE_REPOSITORY,
      useClass: IdentityDocumentTypeTypeOrmRepository,
    },
    CreateIdentityDocumentTypeUseCase,
    UpdateIdentityDocumentTypeUseCase,
    DeleteIdentityDocumentTypeUseCase,
    GetIdentityDocumentTypeByIdUseCase,
    ListIdentityDocumentTypesUseCase,
  ],
})
export class IdentityDocumentTypeModule {}
