import { GetCaseRecordByIdUseCase } from '../get-case-record-by-id.use-case';
import { ICaseRecordRepository } from '../../../../domain/repositories/case-record.repository';
import type { CaseRecordWithRelations } from '../../../../domain/repositories/case-record.repository';

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

    const result = await useCase.execute(99, 100, 'cliente');

    expect(result).toBeNull();
    expect(repository.findByIdWithRelations).toHaveBeenCalledWith(99);
  });

  it('cliente: devuelve null si el titular del caso no coincide con userId', async () => {
    const record = stubCase(1, 200);
    repository.findByIdWithRelations.mockResolvedValue(record);

    const result = await useCase.execute(1, 100, 'cliente');

    expect(result).toBeNull();
  });

  it('cliente: devuelve el registro si el titular coincide con userId', async () => {
    const record = stubCase(1, 100);
    repository.findByIdWithRelations.mockResolvedValue(record);

    const result = await useCase.execute(1, 100, 'cliente');

    expect(result).toEqual(record);
  });

  it('asesor: devuelve el caso aunque userId no sea el titular', async () => {
    const record = stubCase(1, 200);
    repository.findByIdWithRelations.mockResolvedValue(record);

    const result = await useCase.execute(1, 999, 'asesor');

    expect(result).toEqual(record);
  });

  it('administrador: devuelve el caso aunque userId no sea el titular', async () => {
    const record = stubCase(1, 200);
    repository.findByIdWithRelations.mockResolvedValue(record);

    const result = await useCase.execute(1, 999, 'administrador');

    expect(result).toEqual(record);
  });

  it('rol vacío o no-cliente: no aplica filtro por titular', async () => {
    const record = stubCase(1, 200);
    repository.findByIdWithRelations.mockResolvedValue(record);

    const result = await useCase.execute(1, 1, '');

    expect(result).toEqual(record);
  });
});
