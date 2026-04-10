import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CaseRecord } from '../../../domain/entities/case-record.entity';
import { ServiceCases } from '../../../domain/entities/service-cases.entity';
import type { ICaseRecordRepository } from '../../../domain/repositories/case-record.repository';
import type { IPersonRepository } from '../../../domain/repositories/person.repository';
import type { IServiceCasesRepository } from '../../../domain/repositories/service-cases.repository';
import type { IServiceCompanyRepository } from '../../../domain/repositories/service-company.repository';
import { CaseRecordService } from '../../../domain/services/case-record.service';
import { CASE_RECORD_REPOSITORY } from '../../tokens/case-record.repository.token';
import { PERSON_REPOSITORY } from '../../tokens/person.repository.token';
import { SERVICE_CASES_REPOSITORY } from '../../tokens/service-cases.repository.token';
import { SERVICE_COMPANY_REPOSITORY } from '../../tokens/service-company.repository.token';
import { nowColombia } from '../../../infrastructure/utils/date.util';
import { SendCaseCreatedEmailUseCase } from '../email/send-case-created-email.use-case';

const DEFAULT_STATE_RADICADO = 1;
const MAX_UNIQUE_CODE_ATTEMPTS = 10;

export interface CaseRecordCreationInput {
  amount: string;
  /** Sin servicios aún: `null`, omitido o array vacío (se agregan luego con case-services). */
  serviceIds?: number[] | null;
}

export interface CreateCaseRecordContext {
  holder: number;
  codeCompany: number;
  agentPersonId?: number | null;
}

@Injectable()
export class CreateCaseRecordUseCase {
  private readonly logger = new Logger(CreateCaseRecordUseCase.name);

  constructor(
    @Inject(CASE_RECORD_REPOSITORY)
    private readonly repository: ICaseRecordRepository,
    private readonly caseRecordService: CaseRecordService,
    @Inject(PERSON_REPOSITORY)
    private readonly persons: IPersonRepository,
    @Inject(SERVICE_COMPANY_REPOSITORY)
    private readonly serviceCompanyRepository: IServiceCompanyRepository,
    @Inject(SERVICE_CASES_REPOSITORY)
    private readonly serviceCasesRepository: IServiceCasesRepository,
    private readonly sendCaseCreatedEmail: SendCaseCreatedEmailUseCase,
    private readonly config: ConfigService,
  ) {}

  async execute(
    input: CaseRecordCreationInput,
    context: CreateCaseRecordContext,
  ): Promise<CaseRecord> {
    const holderPerson = await this.persons.findById(
      context.holder,
      context.codeCompany,
    );
    if (!holderPerson) {
      throw new Error('PERSON_NOT_FOUND');
    }

    const existingCase = await this.repository.findByHolderAndCompany(
      context.holder,
      context.codeCompany,
    );
    if (existingCase) {
      throw new Error('CASE_ALREADY_EXISTS_FOR_HOLDER');
    }

    const serviceIds =
      input.serviceIds == null || input.serviceIds.length === 0
        ? []
        : [...new Set(input.serviceIds)];
    for (const idService of serviceIds) {
      const svc = await this.serviceCompanyRepository.findByCodeCompanyAndId(
        idService,
        context.codeCompany,
      );
      if (!svc) {
        throw new Error('SERVICE_COMPANY_NOT_FOUND');
      }
    }

    const caseCode = await this.generateUniqueCaseCode();
    const now = nowColombia();
    const amount = input.amount.trim();

    const entity = new CaseRecord(
      undefined,
      caseCode,
      context.holder,
      context.agentPersonId ?? null,
      context.codeCompany,
      amount,
      DEFAULT_STATE_RADICADO,
      now,
      null,
    );
    const saved = await this.repository.save(entity);
    const idCase = saved.idCase;
    if (idCase === undefined) {
      throw new Error('CASE_RECORD_SAVE_FAILED');
    }

    for (const idService of serviceIds) {
      const row = new ServiceCases(
        undefined,
        idCase,
        idService,
        null,
        nowColombia(),
      );
      await this.serviceCasesRepository.save(row);
    }

    await this.trySendCaseCreatedEmail(saved, context);
    return saved;
  }

  private resolveCaseDetailLink(idCase: number | undefined): string | undefined {
    const base = this.config.get<string>('EMAIL_CASE_DETAIL_BASE_URL')?.trim();
    if (!base || idCase == null) {
      return undefined;
    }
    return `${base.replace(/\/$/, '')}/${idCase}`;
  }

  private async trySendCaseCreatedEmail(
    saved: CaseRecord,
    context: CreateCaseRecordContext,
  ): Promise<void> {
    try {
      const person = await this.persons.findById(
        context.holder,
        context.codeCompany,
      );
      if (!person) {
        this.logger.warn(
          `Correo de caso creado omitido: no existe la persona titular ${context.holder}`,
        );
        return;
      }
      const to = person.email?.trim();
      if (!to) {
        this.logger.warn(
          `Correo de caso creado omitido: la persona ${context.holder} no tiene email`,
        );
        return;
      }
      const name = person.fullName?.trim() || 'Usuario';
      await this.sendCaseCreatedEmail.execute({
        to,
        name,
        language: person.language ?? 'es',
        caseCode: saved.caseCode,
        caseDetailLink: this.resolveCaseDetailLink(saved.idCase),
      });
    } catch (err) {
      this.logger.warn(
        `No se pudo enviar el correo de caso creado: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  private async generateUniqueCaseCode(): Promise<string> {
    for (let attempt = 0; attempt < MAX_UNIQUE_CODE_ATTEMPTS; attempt++) {
      const code = this.caseRecordService.generateCaseCode();
      const existing = await this.repository.findByCaseCode(code);
      if (!existing) {
        return code;
      }
    }
    throw new Error('CASE_CODE_GENERATION_FAILED');
  }
}
