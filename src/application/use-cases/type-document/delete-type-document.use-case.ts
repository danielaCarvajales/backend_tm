import { Inject, Injectable } from '@nestjs/common';
import { ITypeDocumentRepository } from '../../../domain/repositories/type-document.repository';
import { TYPE_DOCUMENT_REPOSITORY } from '../../tokens/type-document.repository.token';

@Injectable()
export class DeleteTypeDocumentUseCase {
  constructor(
    @Inject(TYPE_DOCUMENT_REPOSITORY)
    private readonly repository: ITypeDocumentRepository,
  ) {}

  async execute(idTypeDocument: number): Promise<void> {
    const existing = await this.repository.findById(idTypeDocument);
    if (!existing) {
      throw new Error('TYPE_DOCUMENT_NOT_FOUND');
    }
    const usageCount =
      await this.repository.countDocumentsByTypeDocumentId(idTypeDocument);
    if (usageCount > 0) {
      throw new Error('TYPE_DOCUMENT_IN_USE');
    }
    await this.repository.delete(idTypeDocument);
  }
}
