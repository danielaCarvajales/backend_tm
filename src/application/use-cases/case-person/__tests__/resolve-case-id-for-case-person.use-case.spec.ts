import type { JwtPayload } from '../../../../infrastructure/auth/strategies/jwt.strategy';
import { GetCaseRecordByIdUseCase } from '../../case-record/get-case-record-by-id.use-case';
import { GetOrCreateCurrentCaseUseCase } from '../../case-record/get-or-create-current-case.use-case';
import { ResolveCaseIdForCasePersonUseCase } from '../resolve-case-id-for-case-person.use-case';

function payload(overrides: Partial<JwtPayload>): JwtPayload {
  return {
    userId: 1,
    email: 'a@b.com',
    credentialId: 1,
    codeCompany: 10,
    role: 'cliente',
    ...overrides,
  };
}

describe('ResolveCaseIdForCasePersonUseCase', () => {
  let useCase: ResolveCaseIdForCasePersonUseCase;
  let getCaseRecordById: { execute: jest.Mock };
  let getOrCreateCurrentCase: { execute: jest.Mock };

  beforeEach(() => {
    getCaseRecordById = { execute: jest.fn() };
    getOrCreateCurrentCase = { execute: jest.fn() };
    useCase = new ResolveCaseIdForCasePersonUseCase(
      getCaseRecordById as unknown as GetCaseRecordByIdUseCase,
      getOrCreateCurrentCase as unknown as GetOrCreateCurrentCaseUseCase,
    );
  });

  it('si viene idCase en body, valida acceso y devuelve ese id', async () => {
    const user = payload({ userId: 100, role: 'cliente' });
    getCaseRecordById.execute.mockResolvedValue({
      idCase: 50,
      holder: 100,
    });

    const result = await useCase.execute(user, 50);

    expect(result).toBe(50);
    expect(getCaseRecordById.execute).toHaveBeenCalledWith(50, 100, 'cliente');
    expect(getOrCreateCurrentCase.execute).not.toHaveBeenCalled();
  });

  it('si viene idCase pero GetCaseRecordById devuelve null, lanza CASE_NOT_FOUND', async () => {
    const user = payload({ role: 'asesor' });
    getCaseRecordById.execute.mockResolvedValue(null);

    await expect(useCase.execute(user, 88)).rejects.toThrow('CASE_NOT_FOUND');
    expect(getOrCreateCurrentCase.execute).not.toHaveBeenCalled();
  });

  it('sin idCase, si el rol no es cliente, lanza CASE_ID_REQUIRED_FOR_ROLE', async () => {
    const user = payload({ role: 'administrador' });

    await expect(useCase.execute(user, undefined)).rejects.toThrow(
      'CASE_ID_REQUIRED_FOR_ROLE',
    );
    expect(getOrCreateCurrentCase.execute).not.toHaveBeenCalled();
  });

  it('sin idCase y rol cliente, usa getOrCreateCurrentCase y devuelve idCase', async () => {
    const user = payload({ userId: 200, codeCompany: 10, role: 'cliente' });
    getOrCreateCurrentCase.execute.mockResolvedValue({ idCase: 33 });

    const result = await useCase.execute(user, undefined);

    expect(result).toBe(33);
    expect(getCaseRecordById.execute).not.toHaveBeenCalled();
    expect(getOrCreateCurrentCase.execute).toHaveBeenCalledWith(200, 10);
  });
});
