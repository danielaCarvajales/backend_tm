import { Inject, Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { IDocumentRepository } from '../../../domain/repositories/document.repository';
import { IFileStoragePort } from '../../../domain/storage/file-storage.port';
import { DOCUMENT_REPOSITORY } from '../../tokens/document.repository.token';
import { FILE_STORAGE_PORT } from '../../tokens/file-storage.port.token';

@Injectable()
export class DeleteDocumentUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly repository: IDocumentRepository,
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStorage: IFileStoragePort,
  ) {}

  async execute(idDocument: number): Promise<void> {
    const existing = await this.repository.findById(idDocument);
    if (!existing) {
      throw new Error('DOCUMENT_NOT_FOUND');
    }

    const publicPath = existing.urlDocument;

    try {
      await this.repository.delete(idDocument);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        throw new Error('DOCUMENT_IN_USE');
      }
      throw err;
    }

    await this.fileStorage.deleteByPublicPath(publicPath);
  }
}
