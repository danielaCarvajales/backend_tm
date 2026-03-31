import { QueryFailedError } from 'typeorm';
import { Document } from '../../../../domain/entities/document.entity';
import { IDocumentRepository } from '../../../../domain/repositories/document.repository';
import { IFileStoragePort } from '../../../../domain/storage/file-storage.port';
import { DeleteDocumentUseCase } from '../delete-document.use-case';

describe('DeleteDocumentUseCase', () => {
  let useCase: DeleteDocumentUseCase;
  let repository: jest.Mocked<IDocumentRepository>;
  let fileStorage: jest.Mocked<IFileStoragePort>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findPaginated: jest.fn(),
    };
    fileStorage = {
      upload: jest.fn(),
      deleteByPublicPath: jest.fn(),
      downloadByPublicPath: jest.fn(),
    };
    useCase = new DeleteDocumentUseCase(repository, fileStorage);
  });

  const existing = new Document(
    9,
    'old.pdf',
    null,
    'https://cdn/doc.pdf',
    'application/pdf',
    null,
    new Date(),
  );

  it('lanza DOCUMENT_NOT_FOUND si no existe el documento', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(9)).rejects.toThrow('DOCUMENT_NOT_FOUND');
    expect(repository.delete).not.toHaveBeenCalled();
    expect(fileStorage.deleteByPublicPath).not.toHaveBeenCalled();
  });

  it('si delete en BD lanza QueryFailedError, propaga DOCUMENT_IN_USE', async () => {
    repository.findById.mockResolvedValue(existing);
    repository.delete.mockRejectedValue(
      new QueryFailedError('', [], {} as never),
    );

    await expect(useCase.execute(9)).rejects.toThrow('DOCUMENT_IN_USE');
    expect(fileStorage.deleteByPublicPath).not.toHaveBeenCalled();
  });

  it('elimina fila y luego el archivo en storage', async () => {
    repository.findById.mockResolvedValue(existing);
    repository.delete.mockResolvedValue(undefined);
    fileStorage.deleteByPublicPath.mockResolvedValue(undefined);

    await useCase.execute(9);

    expect(repository.delete).toHaveBeenCalledWith(9);
    expect(fileStorage.deleteByPublicPath).toHaveBeenCalledWith(
      'https://cdn/doc.pdf',
    );
  });
});
