import { Inject, Injectable } from '@nestjs/common';
import { State } from '../../../domain/entities/state.entity';
import { IStateRepository } from '../../../domain/repositories/state.repository';
import { CreateStateDto } from '../../dto/state/create-state.dto';
import { STATE_REPOSITORY } from '../../tokens/state.repository.token';

@Injectable()
export class CreateStateUseCase {
  constructor(
    @Inject(STATE_REPOSITORY)
    private readonly repository: IStateRepository,
  ) {}

  async execute(dto: CreateStateDto): Promise<State> {
    const entity = new State(undefined, dto.nameState);
    return this.repository.save(entity);
  }
}
