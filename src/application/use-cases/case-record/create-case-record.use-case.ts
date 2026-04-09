import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CaseRecord } from '../../../domain/entities/case-record.entity';
import type { ICaseRecordRepository } from '../../../domain/repositories/case-record.repository';
import type { IPersonRepository } from '../../../domain/repositories/person.repository';
import { CaseRecordService } from '../../../domain/services/case-record.service';
import { CreateCaseRecordDto } from '../../dto/case-record/create-case-record.dto';
import { CASE_RECORD_REPOSITORY } from '../../tokens/case-record.repository.token';
import { PERSON_REPOSITORY } from '../../tokens/person.repository.token';
import { nowColombia } from '../../../infrastructure/utils/date.util';
import { SendCaseCreatedEmailUseCase } from '../email/send-case-created-email.use-case';

const DEFAULT_STATE_RADICADO = 1;
const MAX_UNIQUE_CODE_ATTEMPTS = 10;

export interface CreateCaseRecordContext {
  holder: number;
  codeCompany: number;
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
    private readonly sendCaseCreatedEmail: SendCaseCreatedEmailUseCase,
    private readonly config: ConfigService,
  ) {}

  // Create a new case record.
  async execute(dto: CreateCaseRecordDto, context: CreateCaseRecordContext): Promise<CaseRecord> {
    const caseCode = await this.generateUniqueCaseCode();
    const now = nowColombia();

    const entity = new CaseRecord(
      undefined,
      caseCode,
      context.holder,
      null,
      context.codeCompany,
      DEFAULT_STATE_RADICADO,
      now,
      null,
    );
    const saved = await this.repository.save(entity);
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

  /** No bloquea la creación del caso si el correo falla. */
  private async trySendCaseCreatedEmail(
    saved: CaseRecord,
    context: CreateCaseRecordContext,
  ): Promise<void> {
    try {
      const person = await this.persons.findById(context.holder);
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
