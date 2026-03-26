import { Inject, Injectable } from '@nestjs/common';
import { State } from '../../../domain/entities/state.entity';
import { IStateRepository } from '../../../domain/repositories/state.repository';
import { UpdateStateDto } from '../../dto/state/update-state.dto';
import { STATE_REPOSITORY } from '../../tokens/state.repository.token';

@Injectable()
export class UpdateStateUseCase {
  constructor(
    @Inject(STATE_REPOSITORY)
    private readonly repository: IStateRepository,
  ) {}

  async execute(idState: number, dto: UpdateStateDto): Promise<State> {
    const existing = await this.repository.findById(idState);
    if (!existing) {
      throw new Error('STATE_NOT_FOUND');
    }
    const updated = new State(idState, dto.nameState ?? existing.nameState);
    return this.repository.update(updated);
  }
}
