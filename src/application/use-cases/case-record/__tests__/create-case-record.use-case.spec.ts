import { CaseRecord } from '../../../../domain/entities/case-record.entity';
import { Person } from '../../../../domain/entities/person.entity';
import { ICaseRecordRepository } from '../../../../domain/repositories/case-record.repository';
import { CaseRecordService } from '../../../../domain/services/case-record.service';
import type { IPersonRepository } from '../../../../domain/repositories/person.repository';
import type { IServiceCasesRepository } from '../../../../domain/repositories/service-cases.repository';
import type { IServiceCompanyRepository } from '../../../../domain/repositories/service-company.repository';
import { SendCaseCreatedEmailUseCase } from '../../email/send-case-created-email.use-case';
import { ConfigService } from '@nestjs/config';
import {
  CreateCaseRecordUseCase,
  CreateCaseRecordContext,
} from '../create-case-record.use-case';

describe('CreateCaseRecordUseCase', () => {
  let useCase: CreateCaseRecordUseCase;
  let repository: jest.Mocked<ICaseRecordRepository>;
  let caseRecordService: { generateCaseCode: jest.Mock };
  let persons: jest.Mocked<IPersonRepository>;
  let serviceCompanyRepository: jest.Mocked<IServiceCompanyRepository>;
  let serviceCasesRepository: jest.Mocked<IServiceCasesRepository>;
  let sendCaseCreatedEmail: jest.Mocked<Pick<SendCaseCreatedEmailUseCase, 'execute'>>;
  let config: { get: jest.Mock };

  const context: CreateCaseRecordContext = {
    holder: 100,
    codeCompany: 7,
    agentPersonId: 50,
  };

  const input = { amount: '100.00', serviceIds: [3] };

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByCaseCode: jest.fn(),
      findByHolderAndCompany: jest.fn().mockResolvedValue(null),
      findByIdWithRelations: jest.fn(),
      findPaginated: jest.fn(),
    };
    caseRecordService = { generateCaseCode: jest.fn() };
    persons = {
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn().mockResolvedValue(
        new Person(
          context.holder,
          context.codeCompany,
          'P1',
          'Titular',
          1,
          '1',
          new Date(),
          1,
          '',
          't@example.com',
        ),
      ),
      findByIdWithRelations: jest.fn(),
      findByPersonCode: jest.fn(),
      findPaginated: jest.fn(),
    };
    serviceCompanyRepository = {
      findByCodeCompanyAndId: jest.fn().mockResolvedValue({ idService: 3 }),
    } as unknown as jest.Mocked<IServiceCompanyRepository>;
    serviceCasesRepository = {
      save: jest.fn().mockImplementation(async (e) => e),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByCaseAndId: jest.fn(),
      findByCaseAndIdWithRelations: jest.fn(),
      findByCaseAndService: jest.fn().mockResolvedValue(null),
      findPaginated: jest.fn(),
      findPaginatedWithRelations: jest.fn(),
    };
    sendCaseCreatedEmail = { execute: jest.fn().mockResolvedValue(undefined) };
    config = { get: jest.fn().mockReturnValue(undefined) };
    useCase = new CreateCaseRecordUseCase(
      repository,
      caseRecordService as unknown as CaseRecordService,
      persons,
      serviceCompanyRepository,
      serviceCasesRepository,
      sendCaseCreatedEmail as unknown as SendCaseCreatedEmailUseCase,
      config as unknown as ConfigService,
    );
  });

  it('genera código único, persiste caso y servicios, devuelve el caso guardado', async () => {
    const caseCode = 'CAS99999';
    caseRecordService.generateCaseCode.mockReturnValue(caseCode);
    repository.findByCaseCode.mockResolvedValue(null);
    const saved = new CaseRecord(
      1,
      caseCode,
      context.holder,
      context.agentPersonId ?? null,
      context.codeCompany,
      '100.00',
      1,
      new Date(),
      null,
    );
    repository.save.mockResolvedValue(saved);

    const result = await useCase.execute(input, context);

    expect(result).toBe(saved);
    expect(repository.findByCaseCode).toHaveBeenCalledWith(caseCode);
    expect(repository.save).toHaveBeenCalledTimes(1);
    const passed = repository.save.mock.calls[0][0] as CaseRecord;
    expect(passed.caseCode).toBe(caseCode);
    expect(passed.holder).toBe(context.holder);
    expect(passed.codeCompany).toBe(context.codeCompany);
    expect(passed.amount).toBe('100.00');
    expect(passed.idStateCase).toBe(1);
    expect(passed.agent).toBe(context.agentPersonId);
    expect(passed.closingDate).toBeNull();
    expect(serviceCasesRepository.save).toHaveBeenCalled();
  });

  it('con serviceIds null no valida ni persiste service cases', async () => {
    const caseCode = 'CAS77777';
    caseRecordService.generateCaseCode.mockReturnValue(caseCode);
    repository.findByCaseCode.mockResolvedValue(null);
    const saved = new CaseRecord(
      5,
      caseCode,
      context.holder,
      context.agentPersonId ?? null,
      context.codeCompany,
      '50.00',
      1,
      new Date(),
      null,
    );
    repository.save.mockResolvedValue(saved);

    await useCase.execute({ amount: '50.00', serviceIds: null }, context);

    expect(serviceCompanyRepository.findByCodeCompanyAndId).not.toHaveBeenCalled();
    expect(serviceCasesRepository.save).not.toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalled();
  });

  it('reintenta si el código ya existe hasta obtener uno libre', async () => {
    caseRecordService.generateCaseCode
      .mockReturnValueOnce('CAS11111')
      .mockReturnValueOnce('CAS22222');
    repository.findByCaseCode
      .mockResolvedValueOnce(
        new CaseRecord(
          99,
          'CAS11111',
          1,
          null,
          1,
          '1.00',
          1,
          new Date(),
          null,
        ),
      )
      .mockResolvedValueOnce(null);

    const saved = new CaseRecord(
      2,
      'CAS22222',
      context.holder,
      context.agentPersonId ?? null,
      context.codeCompany,
      '100.00',
      1,
      new Date(),
      null,
    );
    repository.save.mockResolvedValue(saved);

    const result = await useCase.execute(input, context);

    expect(result.caseCode).toBe('CAS22222');
    expect(repository.findByCaseCode).toHaveBeenCalledTimes(2);
    expect(caseRecordService.generateCaseCode).toHaveBeenCalledTimes(2);
  });

  it('lanza CASE_CODE_GENERATION_FAILED si todos los intentos chocan', async () => {
    caseRecordService.generateCaseCode.mockReturnValue('CAS00000');
    repository.findByCaseCode.mockResolvedValue(
      new CaseRecord(
        1,
        'CAS00000',
        1,
        null,
        1,
        '1.00',
        1,
        new Date(),
        null,
      ),
    );

    await expect(useCase.execute(input, context)).rejects.toThrow(
      'CASE_CODE_GENERATION_FAILED',
    );

    expect(repository.findByCaseCode).toHaveBeenCalledTimes(10);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('envía correo de caso creado al titular cuando tiene email', async () => {
    const caseCode = 'CAS88888';
    caseRecordService.generateCaseCode.mockReturnValue(caseCode);
    repository.findByCaseCode.mockResolvedValue(null);
    const saved = new CaseRecord(
      42,
      caseCode,
      context.holder,
      context.agentPersonId ?? null,
      context.codeCompany,
      '100.00',
      1,
      new Date(),
      null,
    );
    repository.save.mockResolvedValue(saved);
    persons.findById.mockResolvedValue(
      new Person(
        context.holder,
        context.codeCompany,
        'P1',
        'María Pérez',
        1,
        '1',
        new Date(),
        1,
        '',
        'maria@example.com',
      ),
    );
    config.get.mockImplementation((key: string) =>
      key === 'EMAIL_CASE_DETAIL_BASE_URL' ? 'https://app.test/cases' : undefined,
    );

    await useCase.execute(input, context);

    expect(sendCaseCreatedEmail.execute).toHaveBeenCalledWith({
      to: 'maria@example.com',
      name: 'María Pérez',
      language: 'es',
      caseCode,
      caseDetailLink: 'https://app.test/cases/42',
    });
  });
});
