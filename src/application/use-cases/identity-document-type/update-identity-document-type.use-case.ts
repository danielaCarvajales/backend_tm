import { Inject, Injectable } from '@nestjs/common';
import { IdentityDocumentType } from '../../../domain/entities/identity-document-type.entity';
import { IIdentityDocumentTypeRepository } from '../../../domain/repositories/identity-document-type.repository';
import { UpdateIdentityDocumentTypeDto } from '../../dto/identity-document-type/update-identity-document-type.dto';
import { IDENTITY_DOCUMENT_TYPE_REPOSITORY } from '../../tokens/identity-document-type.repository.token';

@Injectable()
export class UpdateIdentityDocumentTypeUseCase {
  constructor(
    @Inject(IDENTITY_DOCUMENT_TYPE_REPOSITORY)
    private readonly repository: IIdentityDocumentTypeRepository,
  ) {}

  async execute(
    idTypeIdentificationDocument: number,
    dto: UpdateIdentityDocumentTypeDto,
  ): Promise<IdentityDocumentType> {
    const existing = await this.repository.findById(idTypeIdentificationDocument);
    if (!existing) {
      throw new Error('IDENTITY_DOCUMENT_TYPE_NOT_FOUND');
    }
    const updated = new IdentityDocumentType(
      idTypeIdentificationDocument,
      dto.name ?? existing.name,
      dto.abbreviation ?? existing.abbreviation,
    );
    return this.repository.update(updated);
  }
}
