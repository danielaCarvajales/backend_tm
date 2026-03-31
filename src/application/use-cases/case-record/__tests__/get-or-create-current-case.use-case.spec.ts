import { CaseRecord } from '../../../../domain/entities/case-record.entity';
import { ICaseRecordRepository } from '../../../../domain/repositories/case-record.repository';
import type { CaseRecordWithRelations } from '../../../../domain/repositories/case-record.repository';
import { CreateCaseRecordUseCase } from '../create-case-record.use-case';
import { GetOrCreateCurrentCaseUseCase } from '../get-or-create-current-case.use-case';

function stubCase(
  idCase: number,
  holder: number,
): CaseRecordWithRelations {
  return {
    idCase,
    caseCode: `CAS${idCase}`,
    holder,
    agent: null,
    codeCompany: 1,
    idStateCase: 1,
    createdAt: new Date(),
    closingDate: null,
    holderPerson: {} as CaseRecordWithRelations['holderPerson'],
    agentPerson: null,
    company: {} as CaseRecordWithRelations['company'],
    stateCase: {} as CaseRecordWithRelations['stateCase'],
    services: [],
    persons: [],
  };
}

describe('GetOrCreateCurrentCaseUseCase', () => {
  let useCase: GetOrCreateCurrentCaseUseCase;
  let repository: jest.Mocked<ICaseRecordRepository>;
  let createCaseRecordUseCase: { execute: jest.Mock };

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
    createCaseRecordUseCase = {
      execute: jest.fn(),
    };
    useCase = new GetOrCreateCurrentCaseUseCase(
      repository,
      createCaseRecordUseCase as unknown as CreateCaseRecordUseCase,
    );
  });

  const holder = 100;
  const codeCompany = 5;

  it('devuelve el caso existente si findByHolderAndCompany encuentra uno', async () => {
    const existing = stubCase(7, holder);
    repository.findByHolderAndCompany.mockResolvedValue(existing);

    const result = await useCase.execute(holder, codeCompany);

    expect(result).toBe(existing);
    expect(repository.findByHolderAndCompany).toHaveBeenCalledWith(
      holder,
      codeCompany,
    );
    expect(createCaseRecordUseCase.execute).not.toHaveBeenCalled();
  });

  it('crea caso y devuelve relaciones si no existía previo', async () => {
    repository.findByHolderAndCompany.mockResolvedValue(null);
    const created = new CaseRecord(
      42,
      'CAS00001',
      holder,
      null,
      codeCompany,
      1,
      new Date(),
      null,
    );
    createCaseRecordUseCase.execute.mockResolvedValue(created);
    const withRelations = stubCase(42, holder);
    repository.findByIdWithRelations.mockResolvedValue(withRelations);

    const result = await useCase.execute(holder, codeCompany);

    expect(createCaseRecordUseCase.execute).toHaveBeenCalledWith(
      {},
      { holder, codeCompany },
    );
    expect(repository.findByIdWithRelations).toHaveBeenCalledWith(42);
    expect(result).toBe(withRelations);
  });

  it('lanza error si tras crear no se puede cargar el caso con relaciones', async () => {
    repository.findByHolderAndCompany.mockResolvedValue(null);
    const created = new CaseRecord(
      42,
      'CAS00001',
      holder,
      null,
      codeCompany,
      1,
      new Date(),
      null,
    );
    createCaseRecordUseCase.execute.mockResolvedValue(created);
    repository.findByIdWithRelations.mockResolvedValue(null);

    await expect(useCase.execute(holder, codeCompany)).rejects.toThrow(
      'CASE_RECORD_CREATED_BUT_NOT_FOUND',
    );
  });
});
