import { Inject, Injectable } from '@nestjs/common';
import { Document } from '../../../domain/entities/document.entity';
import { IDocumentRepository } from '../../../domain/repositories/document.repository';
import { IFileStoragePort } from '../../../domain/storage/file-storage.port';
import { CreateDocumentDto } from '../../dto/document/create-document.dto';
import { normalizeDocumentDescription } from '../../utils/normalize-document-description';
import { DOCUMENT_REPOSITORY } from '../../tokens/document.repository.token';
import { FILE_STORAGE_PORT } from '../../tokens/file-storage.port.token';

@Injectable()
export class CreateDocumentUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly repository: IDocumentRepository,
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStorage: IFileStoragePort,
  ) {}

  async execute(
    dto: CreateDocumentDto,
    file: Express.Multer.File,
  ): Promise<Document> {
    const description = normalizeDocumentDescription(dto.descriptionDocument);
    let publicPath: string | undefined;
    try {
      const uploadResult = await this.fileStorage.upload({
        body: file.buffer,
        mimeType: file.mimetype,
        originalFileName: file.originalname,
      });
      publicPath = uploadResult.publicPath;

      const entity = new Document(
        undefined,
        file.originalname,
        description,
        uploadResult.publicPath,
        file.mimetype,
        dto.idTypeDocument ?? null,
        new Date(),
      );
      return await this.repository.save(entity);
    } catch (err) {
      if (publicPath) {
        try {
          await this.fileStorage.deleteByPublicPath(publicPath);
        } catch {
          // best-effort rollback
        }
      }
      throw err;
    }
  }
}
