import { Inject, Injectable } from '@nestjs/common';
import { State } from '../../../domain/entities/state.entity';
import { IStateRepository } from '../../../domain/repositories/state.repository';
import { STATE_REPOSITORY } from '../../tokens/state.repository.token';

@Injectable()
export class GetStateByIdUseCase {
  constructor(
    @Inject(STATE_REPOSITORY)
    private readonly repository: IStateRepository,
  ) {}

  async execute(idState: number): Promise<State | null> {
    return this.repository.findById(idState);
  }
}
