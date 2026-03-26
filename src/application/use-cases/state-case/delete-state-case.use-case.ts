import { Inject, Injectable } from '@nestjs/common';
import { IStateCaseRepository } from '../../../domain/repositories/state-case.repository';
import { STATE_CASE_REPOSITORY } from '../../tokens/state-case.repository.token';

@Injectable()
export class DeleteStateCaseUseCase {
  constructor(
    @Inject(STATE_CASE_REPOSITORY)
    private readonly repository: IStateCaseRepository,
  ) {}

  async execute(idState: number): Promise<void> {
    const existing = await this.repository.findById(idState);
    if (!existing) {
      throw new Error('STATE_CASE_NOT_FOUND');
    }
    const usageCount = await this.repository.countCaseRecordsByStateId(idState);
    if (usageCount > 0) {
      throw new Error('STATE_CASE_IN_USE');
    }
    await this.repository.delete(idState);
  }
}
