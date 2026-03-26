import { Inject, Injectable } from '@nestjs/common';
import { IdentityDocumentType } from '../../../domain/entities/identity-document-type.entity';
import { IIdentityDocumentTypeRepository } from '../../../domain/repositories/identity-document-type.repository';
import { IDENTITY_DOCUMENT_TYPE_REPOSITORY } from '../../tokens/identity-document-type.repository.token';

@Injectable()
export class GetIdentityDocumentTypeByIdUseCase {
  constructor(
    @Inject(IDENTITY_DOCUMENT_TYPE_REPOSITORY)
    private readonly repository: IIdentityDocumentTypeRepository,
  ) {}

  async execute(idTypeIdentificationDocument: number): Promise<IdentityDocumentType | null> {
    return this.repository.findById(idTypeIdentificationDocument);
  }
}
