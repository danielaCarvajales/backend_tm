import { Inject, Injectable } from '@nestjs/common';
import { StateCase } from '../../../domain/entities/state-case.entity';
import { IStateCaseRepository } from '../../../domain/repositories/state-case.repository';
import { CreateStateCaseDto } from '../../dto/state-case/create-state-case.dto';
import { STATE_CASE_REPOSITORY } from '../../tokens/state-case.repository.token';

@Injectable()
export class CreateStateCaseUseCase {
  constructor(
    @Inject(STATE_CASE_REPOSITORY)
    private readonly repository: IStateCaseRepository,
  ) {}

  async execute(dto: CreateStateCaseDto): Promise<StateCase> {
    const existing = await this.repository.findByName(dto.nameState.trim());
    if (existing) {
      throw new Error('STATE_CASE_NAME_ALREADY_EXISTS');
    }
    const entity = new StateCase(undefined, dto.nameState.trim());
    return this.repository.save(entity);
  }
}
