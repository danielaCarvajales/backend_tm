import { Inject, Injectable } from '@nestjs/common';
import { IStateRepository } from '../../../domain/repositories/state.repository';
import { STATE_REPOSITORY } from '../../tokens/state.repository.token';

@Injectable()
export class DeleteStateUseCase {
  constructor(
    @Inject(STATE_REPOSITORY)
    private readonly repository: IStateRepository,
  ) {}

  async execute(idState: number): Promise<void> {
    const existing = await this.repository.findById(idState);
    if (!existing) {
      throw new Error('STATE_NOT_FOUND');
    }
    await this.repository.delete(idState);
  }
}
