import { Inject, Injectable } from '@nestjs/common';
import { TypeDocument } from '../../../domain/entities/type-document.entity';
import { ITypeDocumentRepository } from '../../../domain/repositories/type-document.repository';
import { UpdateTypeDocumentDto } from '../../dto/type-document/update-type-document.dto';
import { TYPE_DOCUMENT_REPOSITORY } from '../../tokens/type-document.repository.token';

@Injectable()
export class UpdateTypeDocumentUseCase {
  constructor(
    @Inject(TYPE_DOCUMENT_REPOSITORY)
    private readonly repository: ITypeDocumentRepository,
  ) {}

  async execute(
    idTypeDocument: number,
    dto: UpdateTypeDocumentDto,
  ): Promise<TypeDocument> {
    const existing = await this.repository.findById(idTypeDocument);
    if (!existing) {
      throw new Error('TYPE_DOCUMENT_NOT_FOUND');
    }
    if (
      dto.nameTypeDocument !== undefined &&
      dto.nameTypeDocument.trim() !== existing.nameTypeDocument
    ) {
      const duplicate = await this.repository.findByName(
        dto.nameTypeDocument.trim(),
      );
      if (duplicate && duplicate.idTypeDocument !== idTypeDocument) {
        throw new Error('TYPE_DOCUMENT_NAME_ALREADY_EXISTS');
      }
    }
    const updated = new TypeDocument(
      idTypeDocument,
      dto.nameTypeDocument?.trim() ?? existing.nameTypeDocument,
    );
    return this.repository.update(updated);
  }
}
