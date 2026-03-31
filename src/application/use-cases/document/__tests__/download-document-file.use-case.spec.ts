import { Document } from '../../../../domain/entities/document.entity';
import { IDocumentRepository } from '../../../../domain/repositories/document.repository';
import { IFileStoragePort } from '../../../../domain/storage/file-storage.port';
import { DownloadDocumentFileUseCase } from '../download-document-file.use-case';

describe('DownloadDocumentFileUseCase', () => {
  let useCase: DownloadDocumentFileUseCase;
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
    useCase = new DownloadDocumentFileUseCase(repository, fileStorage);
  });

  const doc = new Document(
    5,
    'contrato.pdf',
    null,
    '/documents/a.pdf',
    'application/pdf',
    null,
    new Date(),
  );

  it('lanza DOCUMENT_NOT_FOUND si el documento no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(5)).rejects.toThrow('DOCUMENT_NOT_FOUND');
    expect(fileStorage.downloadByPublicPath).not.toHaveBeenCalled();
  });

  it('devuelve buffer, mime y nombre usando contentType del storage', async () => {
    repository.findById.mockResolvedValue(doc);
    fileStorage.downloadByPublicPath.mockResolvedValue({
      body: Buffer.from([1, 2, 3]),
      contentType: 'application/pdf',
    });

    const result = await useCase.execute(5);

    expect(result.buffer.equals(Buffer.from([1, 2, 3]))).toBe(true);
    expect(result.mimeType).toBe('application/pdf');
    expect(result.fileName).toBe('contrato.pdf');
    expect(fileStorage.downloadByPublicPath).toHaveBeenCalledWith(
      '/documents/a.pdf',
    );
  });

  it('si storage no devuelve contentType, usa mimeType del documento', async () => {
    repository.findById.mockResolvedValue(doc);
    fileStorage.downloadByPublicPath.mockResolvedValue({
      body: Buffer.from('x'),
      contentType: undefined,
    });

    const result = await useCase.execute(5);

    expect(result.mimeType).toBe('application/pdf');
  });

  it('si download falla, lanza STORAGE_DOWNLOAD_FAILED', async () => {
    repository.findById.mockResolvedValue(doc);
    fileStorage.downloadByPublicPath.mockRejectedValue(new Error('network'));

    await expect(useCase.execute(5)).rejects.toThrow('STORAGE_DOWNLOAD_FAILED');
  });
});
