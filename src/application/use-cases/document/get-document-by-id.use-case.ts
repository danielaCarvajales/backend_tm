import { Inject, Injectable } from '@nestjs/common';
import { Document } from '../../../domain/entities/document.entity';
import { IDocumentRepository } from '../../../domain/repositories/document.repository';
import { DOCUMENT_REPOSITORY } from '../../tokens/document.repository.token';

@Injectable()
export class GetDocumentByIdUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly repository: IDocumentRepository,
  ) {}

  async execute(idDocument: number): Promise<Document | null> {
    return this.repository.findById(idDocument);
  }
}
