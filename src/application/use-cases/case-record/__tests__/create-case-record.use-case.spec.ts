import { CreateCaseRecordDto } from '../../../dto/case-record/create-case-record.dto';
import { CaseRecord } from '../../../../domain/entities/case-record.entity';
import { ICaseRecordRepository } from '../../../../domain/repositories/case-record.repository';
import { CaseRecordService } from '../../../../domain/services/case-record.service';
import {
  CreateCaseRecordUseCase,
  CreateCaseRecordContext,
} from '../create-case-record.use-case';

describe('CreateCaseRecordUseCase', () => {
  let useCase: CreateCaseRecordUseCase;
  let repository: jest.Mocked<ICaseRecordRepository>;
  let caseRecordService: { generateCaseCode: jest.Mock };

  const context: CreateCaseRecordContext = { holder: 100, codeCompany: 7 };

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByCaseCode: jest.fn(),
      findByHolderAndCompany: jest.fn(),
      findByIdWithRelations: jest.fn(),
      findPaginated: jest.fn(),
    };
    caseRecordService = { generateCaseCode: jest.fn() };
    useCase = new CreateCaseRecordUseCase(
      repository,
      caseRecordService as unknown as CaseRecordService,
    );
  });

  it('genera código único, persiste y devuelve el caso guardado', async () => {
    const caseCode = 'CAS99999';
    caseRecordService.generateCaseCode.mockReturnValue(caseCode);
    repository.findByCaseCode.mockResolvedValue(null);
    const saved = new CaseRecord(
      1,
      caseCode,
      context.holder,
      null,
      context.codeCompany,
      1,
      new Date(),
      null,
    );
    repository.save.mockResolvedValue(saved);

    const dto = new CreateCaseRecordDto();
    const result = await useCase.execute(dto, context);

    expect(result).toBe(saved);
    expect(repository.findByCaseCode).toHaveBeenCalledWith(caseCode);
    expect(repository.save).toHaveBeenCalledTimes(1);
    const passed = repository.save.mock.calls[0][0] as CaseRecord;
    expect(passed.caseCode).toBe(caseCode);
    expect(passed.holder).toBe(context.holder);
    expect(passed.codeCompany).toBe(context.codeCompany);
    expect(passed.idStateCase).toBe(1);
    expect(passed.agent).toBeNull();
    expect(passed.closingDate).toBeNull();
  });

  it('reintenta si el código ya existe hasta obtener uno libre', async () => {
    caseRecordService.generateCaseCode
      .mockReturnValueOnce('CAS11111')
      .mockReturnValueOnce('CAS22222');
    repository.findByCaseCode
      .mockResolvedValueOnce(
        new CaseRecord(99, 'CAS11111', 1, null, 1, 1, new Date(), null),
      )
      .mockResolvedValueOnce(null);

    const saved = new CaseRecord(
      2,
      'CAS22222',
      context.holder,
      null,
      context.codeCompany,
      1,
      new Date(),
      null,
    );
    repository.save.mockResolvedValue(saved);

    const result = await useCase.execute(new CreateCaseRecordDto(), context);

    expect(result.caseCode).toBe('CAS22222');
    expect(repository.findByCaseCode).toHaveBeenCalledTimes(2);
    expect(caseRecordService.generateCaseCode).toHaveBeenCalledTimes(2);
  });

  it('lanza CASE_CODE_GENERATION_FAILED si todos los intentos chocan', async () => {
    caseRecordService.generateCaseCode.mockReturnValue('CAS00000');
    repository.findByCaseCode.mockResolvedValue(
      new CaseRecord(1, 'CAS00000', 1, null, 1, 1, new Date(), null),
    );

    await expect(
      useCase.execute(new CreateCaseRecordDto(), context),
    ).rejects.toThrow('CASE_CODE_GENERATION_FAILED');

    expect(repository.findByCaseCode).toHaveBeenCalledTimes(10);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
