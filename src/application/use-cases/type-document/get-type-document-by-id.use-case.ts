import { Inject, Injectable } from '@nestjs/common';
import { TypeDocument } from '../../../domain/entities/type-document.entity';
import { ITypeDocumentRepository } from '../../../domain/repositories/type-document.repository';
import { TYPE_DOCUMENT_REPOSITORY } from '../../tokens/type-document.repository.token';

@Injectable()
export class GetTypeDocumentByIdUseCase {
  constructor(
    @Inject(TYPE_DOCUMENT_REPOSITORY)
    private readonly repository: ITypeDocumentRepository,
  ) {}

  async execute(idTypeDocument: number): Promise<TypeDocument | null> {
    return this.repository.findById(idTypeDocument);
  }
}
