import { Inject, Injectable } from '@nestjs/common';
import { Document } from '../../../domain/entities/document.entity';
import { IDocumentRepository } from '../../../domain/repositories/document.repository';
import { IFileStoragePort } from '../../../domain/storage/file-storage.port';
import { UpdateDocumentDto } from '../../dto/document/update-document.dto';
import { normalizeDocumentDescription } from '../../utils/normalize-document-description';
import { DOCUMENT_REPOSITORY } from '../../tokens/document.repository.token';
import { FILE_STORAGE_PORT } from '../../tokens/file-storage.port.token';

@Injectable()
export class UpdateDocumentUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly repository: IDocumentRepository,
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStorage: IFileStoragePort,
  ) {}

  async execute(
    idDocument: number,
    dto: UpdateDocumentDto,
    file?: Express.Multer.File,
  ): Promise<Document> {
    const existing = await this.repository.findById(idDocument);
    if (!existing) {
      throw new Error('DOCUMENT_NOT_FOUND');
    }

    const previousPublicPath = existing.urlDocument;

    if (file) {
      const uploadResult = await this.fileStorage.upload({
        body: file.buffer,
        mimeType: file.mimetype,
        originalFileName: file.originalname,
      });

      const description =
        dto.descriptionDocument !== undefined
          ? normalizeDocumentDescription(dto.descriptionDocument)
          : existing.descriptionDocument;
      const idTypeDocument =
        dto.idTypeDocument !== undefined
          ? dto.idTypeDocument
          : existing.idTypeDocument;

      const updated = new Document(
        idDocument,
        file.originalname,
        description,
        uploadResult.publicPath,
        file.mimetype,
        idTypeDocument,
        existing.createdAtDocument,
      );

      try {
        const saved = await this.repository.update(updated);

        try {
          await this.fileStorage.deleteByPublicPath(previousPublicPath);
        } catch {
          // objeto antiguo puede no existir; no bloquear la respuesta
        }

        return saved;
      } catch (err) {
        try {
          await this.fileStorage.deleteByPublicPath(uploadResult.publicPath);
        } catch {
          // best-effort rollback del archivo nuevo
        }
        throw err;
      }
    }

    const description =
      dto.descriptionDocument !== undefined
        ? normalizeDocumentDescription(dto.descriptionDocument)
        : existing.descriptionDocument;
    const idTypeDocument =
      dto.idTypeDocument !== undefined
        ? dto.idTypeDocument
        : existing.idTypeDocument;

    const updated = new Document(
      idDocument,
      existing.nameFileDocument,
      description,
      existing.urlDocument,
      existing.mimeType,
      idTypeDocument,
      existing.createdAtDocument,
    );
    return this.repository.update(updated);
  }
}
