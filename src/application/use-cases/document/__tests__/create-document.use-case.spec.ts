import type { CreateDocumentDto } from '../../../dto/document/create-document.dto';
import { Document } from '../../../../domain/entities/document.entity';
import { IDocumentRepository } from '../../../../domain/repositories/document.repository';
import { IFileStoragePort } from '../../../../domain/storage/file-storage.port';
import { CreateDocumentUseCase } from '../create-document.use-case';

function multerFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'informe.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('%PDF'),
    size: 4,
    stream: undefined as unknown as Express.Multer.File['stream'],
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  };
}

describe('CreateDocumentUseCase', () => {
  let useCase: CreateDocumentUseCase;
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
    useCase = new CreateDocumentUseCase(repository, fileStorage);
  });

  it('sube el archivo, persiste el documento y devuelve el guardado', async () => {
    fileStorage.upload.mockResolvedValue({
      publicPath: 'https://cdn.example/documents/u1.pdf',
    });
    const saved = new Document(
      1,
      'informe.pdf',
      null,
      'https://cdn.example/documents/u1.pdf',
      'application/pdf',
      null,
      new Date(),
    );
    repository.save.mockResolvedValue(saved);

    const dto = {} as CreateDocumentDto;
    const file = multerFile();
    const result = await useCase.execute(dto, file);

    expect(result).toBe(saved);
    expect(fileStorage.upload).toHaveBeenCalledWith({
      body: file.buffer,
      mimeType: 'application/pdf',
      originalFileName: 'informe.pdf',
    });
    expect(repository.save).toHaveBeenCalledTimes(1);
    const entity = repository.save.mock.calls[0][0] as Document;
    expect(entity.urlDocument).toBe('https://cdn.example/documents/u1.pdf');
    expect(entity.mimeType).toBe('application/pdf');
  });

  it('si upload falla, no llama a save y propaga el error', async () => {
    fileStorage.upload.mockRejectedValue(new Error('STORAGE_UPLOAD_FAILED'));

    await expect(
      useCase.execute({} as CreateDocumentDto, multerFile()),
    ).rejects.toThrow('STORAGE_UPLOAD_FAILED');

    expect(repository.save).not.toHaveBeenCalled();
    expect(fileStorage.deleteByPublicPath).not.toHaveBeenCalled();
  });

  it('si save falla tras upload, intenta borrar el objeto subido (rollback)', async () => {
    fileStorage.upload.mockResolvedValue({ publicPath: '/documents/key.pdf' });
    repository.save.mockRejectedValue(new Error('DB_ERROR'));

    await expect(
      useCase.execute({} as CreateDocumentDto, multerFile()),
    ).rejects.toThrow('DB_ERROR');

    expect(fileStorage.deleteByPublicPath).toHaveBeenCalledWith('/documents/key.pdf');
  });
});
