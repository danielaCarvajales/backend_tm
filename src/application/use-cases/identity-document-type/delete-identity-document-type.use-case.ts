import { Inject, Injectable } from '@nestjs/common';
import { IIdentityDocumentTypeRepository } from '../../../domain/repositories/identity-document-type.repository';
import { IDENTITY_DOCUMENT_TYPE_REPOSITORY } from '../../tokens/identity-document-type.repository.token';

@Injectable()
export class DeleteIdentityDocumentTypeUseCase {
  constructor(
    @Inject(IDENTITY_DOCUMENT_TYPE_REPOSITORY)
    private readonly repository: IIdentityDocumentTypeRepository,
  ) {}

  async execute(idTypeIdentificationDocument: number): Promise<void> {
    const existing = await this.repository.findById(idTypeIdentificationDocument);
    if (!existing) {
      throw new Error('IDENTITY_DOCUMENT_TYPE_NOT_FOUND');
    }
    await this.repository.delete(idTypeIdentificationDocument);
  }
}
