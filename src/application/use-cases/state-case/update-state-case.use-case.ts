import { Inject, Injectable } from '@nestjs/common';
import { StateCase } from '../../../domain/entities/state-case.entity';
import { IStateCaseRepository } from '../../../domain/repositories/state-case.repository';
import { UpdateStateCaseDto } from '../../dto/state-case/update-state-case.dto';
import { STATE_CASE_REPOSITORY } from '../../tokens/state-case.repository.token';

@Injectable()
export class UpdateStateCaseUseCase {
  constructor(
    @Inject(STATE_CASE_REPOSITORY)
    private readonly repository: IStateCaseRepository,
  ) {}

  async execute(idState: number, dto: UpdateStateCaseDto): Promise<StateCase> {
    const existing = await this.repository.findById(idState);
    if (!existing) {
      throw new Error('STATE_CASE_NOT_FOUND');
    }
    if (dto.nameState !== undefined && dto.nameState.trim() !== existing.nameState) {
      const duplicate = await this.repository.findByName(dto.nameState.trim());
      if (duplicate && duplicate.idState !== idState) {
        throw new Error('STATE_CASE_NAME_ALREADY_EXISTS');
      }
    }
    const updated = new StateCase(
      idState,
      dto.nameState?.trim() ?? existing.nameState,
    );
    return this.repository.update(updated);
  }
}
