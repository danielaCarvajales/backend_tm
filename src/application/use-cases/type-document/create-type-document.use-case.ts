import { Inject, Injectable } from '@nestjs/common';
import { TypeDocument } from '../../../domain/entities/type-document.entity';
import { ITypeDocumentRepository } from '../../../domain/repositories/type-document.repository';
import { CreateTypeDocumentDto } from '../../dto/type-document/create-type-document.dto';
import { TYPE_DOCUMENT_REPOSITORY } from '../../tokens/type-document.repository.token';

@Injectable()
export class CreateTypeDocumentUseCase {
  constructor(
    @Inject(TYPE_DOCUMENT_REPOSITORY)
    private readonly repository: ITypeDocumentRepository,
  ) {}

  async execute(dto: CreateTypeDocumentDto): Promise<TypeDocument> {
    const existing = await this.repository.findByName(
      dto.nameTypeDocument.trim(),
    );
    if (existing) {
      throw new Error('TYPE_DOCUMENT_NAME_ALREADY_EXISTS');
    }
    const entity = new TypeDocument(undefined, dto.nameTypeDocument.trim());
    return this.repository.save(entity);
  }
}
