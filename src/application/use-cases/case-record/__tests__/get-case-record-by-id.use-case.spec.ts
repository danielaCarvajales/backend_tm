import { GetCaseRecordByIdUseCase } from '../get-case-record-by-id.use-case';
import { ICaseRecordRepository } from '../../../../domain/repositories/case-record.repository';
import type { CaseRecordWithRelations } from '../../../../domain/repositories/case-record.repository';

function stubCase(
  idCase: number,
  holder: number,
  codeCompany = 1,
): CaseRecordWithRelations {
  return {
    idCase,
    caseCode: `CAS${idCase}`,
    holder,
    agent: null,
    codeCompany,
    amount: '0.00',
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

describe('GetCaseRecordByIdUseCase', () => {
  let useCase: GetCaseRecordByIdUseCase;
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
    useCase = new GetCaseRecordByIdUseCase(repository);
  });

  it('devuelve null si el repositorio no encuentra el caso', async () => {
    repository.findByIdWithRelations.mockResolvedValue(null);

    const result = await useCase.execute(99, 100, 'cliente', 10);

    expect(result).toBeNull();
    expect(repository.findByIdWithRelations).toHaveBeenCalledWith(99);
  });

  it('cliente: devuelve null si el titular del caso no coincide con userId', async () => {
    const record = stubCase(1, 200);
    repository.findByIdWithRelations.mockResolvedValue(record);

    const result = await useCase.execute(1, 100, 'cliente', 10);

    expect(result).toBeNull();
  });

  it('cliente: devuelve el registro si el titular coincide con userId', async () => {
    const record = stubCase(1, 100);
    repository.findByIdWithRelations.mockResolvedValue(record);

    const result = await useCase.execute(1, 100, 'cliente', 10);

    expect(result).toEqual(record);
  });

  it('asesor: devuelve el caso si la compañía del visor coincide', async () => {
    const record = stubCase(1, 200, 10);
    repository.findByIdWithRelations.mockResolvedValue(record);

    const result = await useCase.execute(1, 999, 'asesor', 10);

    expect(result).toEqual(record);
  });

  it('asesor: devuelve null si el caso es de otra compañía', async () => {
    const record = stubCase(1, 200, 99);
    repository.findByIdWithRelations.mockResolvedValue(record);

    const result = await useCase.execute(1, 999, 'asesor', 10);

    expect(result).toBeNull();
  });

  it('administrador: devuelve el caso si la compañía coincide', async () => {
    const record = stubCase(1, 200, 10);
    repository.findByIdWithRelations.mockResolvedValue(record);

    const result = await useCase.execute(1, 999, 'administrador', 10);

    expect(result).toEqual(record);
  });

});
