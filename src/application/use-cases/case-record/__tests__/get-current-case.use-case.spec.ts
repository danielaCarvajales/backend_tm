import { ICaseRecordRepository } from '../../../../domain/repositories/case-record.repository';
import type { CaseRecordWithRelations } from '../../../../domain/repositories/case-record.repository';
import { GetCurrentCaseUseCase } from '../get-current-case.use-case';

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
    amount: '100.00',
    idStateCase: 1,
    createdAt: new Date(),
    closingDate: null,
    holderPerson: {} as CaseRecordWithRelations['holderPerson'],
    agentPerson: null,
    company: {} as CaseRecordWithRelations['company'],
    stateCase: {} as CaseRecordWithRelations['stateCase'],
    services: [],
    persons: [],
    contracts: [],
  };
}

describe('GetCurrentCaseUseCase', () => {
  let useCase: GetCurrentCaseUseCase;
  let repository: jest.Mocked<ICaseRecordRepository>;

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
    useCase = new GetCurrentCaseUseCase(repository);
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
  });

  it('lanza CASE_RECORD_NOT_FOUND si no hay caso para el titular', async () => {
    repository.findByHolderAndCompany.mockResolvedValue(null);

    await expect(useCase.execute(holder, codeCompany)).rejects.toThrow(
      'CASE_RECORD_NOT_FOUND',
    );
  });
});
