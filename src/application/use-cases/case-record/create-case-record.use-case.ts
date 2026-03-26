import { Inject, Injectable } from '@nestjs/common';
import { CaseRecord } from '../../../domain/entities/case-record.entity';
import { ICaseRecordRepository } from '../../../domain/repositories/case-record.repository';
import { CaseRecordService } from '../../../domain/services/case-record.service';
import { CreateCaseRecordDto } from '../../dto/case-record/create-case-record.dto';
import { CASE_RECORD_REPOSITORY } from '../../tokens/case-record.repository.token';
import { nowColombia } from '../../../infrastructure/utils/date.util';

const DEFAULT_STATE_RADICADO = 1;
const MAX_UNIQUE_CODE_ATTEMPTS = 10;

export interface CreateCaseRecordContext {
  holder: number;
  codeCompany: number;
}

@Injectable()
export class CreateCaseRecordUseCase {
  constructor(
    @Inject(CASE_RECORD_REPOSITORY)
    private readonly repository: ICaseRecordRepository,
    private readonly caseRecordService: CaseRecordService,
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
    return this.repository.save(entity);
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
