import { Inject, Injectable } from '@nestjs/common';
import { ICaseRecordRepository } from '../../../domain/repositories/case-record.repository';
import { CASE_RECORD_REPOSITORY } from '../../tokens/case-record.repository.token';

@Injectable()
export class DeleteCaseRecordUseCase {
  constructor(
    @Inject(CASE_RECORD_REPOSITORY)
    private readonly repository: ICaseRecordRepository,
  ) {}

  async execute(idCase: number): Promise<void> {
    const existing = await this.repository.findById(idCase);
    if (!existing) {
      throw new Error('CASE_RECORD_NOT_FOUND');
    }
    await this.repository.delete(idCase);
  }
}
