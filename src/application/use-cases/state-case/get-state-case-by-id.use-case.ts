import { Inject, Injectable } from '@nestjs/common';
import { StateCase } from '../../../domain/entities/state-case.entity';
import { IStateCaseRepository } from '../../../domain/repositories/state-case.repository';
import { STATE_CASE_REPOSITORY } from '../../tokens/state-case.repository.token';

@Injectable()
export class GetStateCaseByIdUseCase {
  constructor(
    @Inject(STATE_CASE_REPOSITORY)
    private readonly repository: IStateCaseRepository,
  ) {}

  async execute(idState: number): Promise<StateCase | null> {
    return this.repository.findById(idState);
  }
}
