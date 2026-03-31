import { Inject, Injectable } from '@nestjs/common';
import { IDocumentRepository } from '../../../domain/repositories/document.repository';
import { IFileStoragePort } from '../../../domain/storage/file-storage.port';
import { DOCUMENT_REPOSITORY } from '../../tokens/document.repository.token';
import { FILE_STORAGE_PORT } from '../../tokens/file-storage.port.token';

@Injectable()
export class DownloadDocumentFileUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly repository: IDocumentRepository,
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStorage: IFileStoragePort,
  ) {}

  async execute(idDocument: number): Promise<{
    buffer: Buffer;
    mimeType: string;
    fileName: string;
  }> {
    const doc = await this.repository.findById(idDocument);
    if (!doc) {
      throw new Error('DOCUMENT_NOT_FOUND');
    }

    try {
      const { body, contentType } = await this.fileStorage.downloadByPublicPath(
        doc.urlDocument,
      );
      return {
        buffer: body,
        mimeType: contentType ?? doc.mimeType,
        fileName: doc.nameFileDocument,
      };
    } catch {
      throw new Error('STORAGE_DOWNLOAD_FAILED');
    }
  }
}
