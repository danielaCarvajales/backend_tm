import { Inject, Injectable } from '@nestjs/common';
import {CaseRecordWithRelations, ICaseRecordRepository} from '../../../domain/repositories/case-record.repository';
import { CASE_RECORD_REPOSITORY } from '../../tokens/case-record.repository.token';

@Injectable()
export class GetCaseRecordByIdUseCase {
  constructor(
    @Inject(CASE_RECORD_REPOSITORY)
    private readonly repository: ICaseRecordRepository,
  ) {}

  async execute(
    idCase: number,
    userId: number,
    role: string,
  ): Promise<CaseRecordWithRelations | null> {
    const record = await this.repository.findByIdWithRelations(idCase);
    if (!record) return null;

    const normalizedRole = role?.toLowerCase() ?? '';
    const isCliente = normalizedRole === 'cliente';
    if (isCliente && record.holder !== userId) {
      return null;
    }
    return record;
  }
}
