import { Inject, Injectable } from '@nestjs/common';
import type { ICaseRecordRepository } from '../../../domain/repositories/case-record.repository';
import { IServiceCasesRepository } from '../../../domain/repositories/service-cases.repository';
import { CASE_RECORD_REPOSITORY } from '../../tokens/case-record.repository.token';
import { SERVICE_CASES_REPOSITORY } from '../../tokens/service-cases.repository.token';

@Injectable()
export class DeleteServiceCasesUseCase {
  constructor(
    @Inject(SERVICE_CASES_REPOSITORY)
    private readonly repository: IServiceCasesRepository,
    @Inject(CASE_RECORD_REPOSITORY)
    private readonly caseRecords: ICaseRecordRepository,
  ) {}

  async execute(
    idServiceCases: number,
    idCase: number,
    codeCompany: number,
  ): Promise<void> {
    const caseRec = await this.caseRecords.findById(idCase);
    if (!caseRec || caseRec.codeCompany !== codeCompany) {
      throw new Error('CASE_RECORD_NOT_FOUND');
    }
    const existing = await this.repository.findByCaseAndId(
      idCase,
      idServiceCases,
    );
    if (!existing) {
      throw new Error('SERVICE_CASES_NOT_FOUND');
    }
    await this.repository.delete(idServiceCases);
  }
}
