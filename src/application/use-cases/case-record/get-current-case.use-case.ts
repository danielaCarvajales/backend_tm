import { Inject, Injectable } from '@nestjs/common';
import {
  CaseRecordWithRelations,
  ICaseRecordRepository,
} from '../../../domain/repositories/case-record.repository';
import { CASE_RECORD_REPOSITORY } from '../../tokens/case-record.repository.token';

@Injectable()
export class GetCurrentCaseUseCase {
  constructor(
    @Inject(CASE_RECORD_REPOSITORY)
    private readonly repository: ICaseRecordRepository,
  ) {}

  async execute(
    holder: number,
    codeCompany: number,
  ): Promise<CaseRecordWithRelations> {
    const existing = await this.repository.findByHolderAndCompany(
      holder,
      codeCompany,
    );
    if (!existing) {
      throw new Error('CASE_RECORD_NOT_FOUND');
    }
    return existing;
  }
}
