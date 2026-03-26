import { Inject, Injectable } from '@nestjs/common';
import {CaseRecordWithRelations, ICaseRecordRepository} from '../../../domain/repositories/case-record.repository';
import { CASE_RECORD_REPOSITORY } from '../../tokens/case-record.repository.token';
import { CreateCaseRecordUseCase } from './create-case-record.use-case';

@Injectable()
export class GetOrCreateCurrentCaseUseCase {
  constructor(
    @Inject(CASE_RECORD_REPOSITORY)
    private readonly repository: ICaseRecordRepository,
    private readonly createCaseRecordUseCase: CreateCaseRecordUseCase,
  ) {}

  async execute(
    holder: number,
    codeCompany: number,
  ): Promise<CaseRecordWithRelations> {
    const existing = await this.repository.findByHolderAndCompany(holder, codeCompany);
    if (existing) {
      return existing;
    }

    const created = await this.createCaseRecordUseCase.execute(
      {},
      { holder, codeCompany },
    );

    const withRelations = await this.repository.findByIdWithRelations(
      created.idCase!,
    );
    if (!withRelations) {
      throw new Error('CASE_RECORD_CREATED_BUT_NOT_FOUND');
    }
    return withRelations;
  }
}
