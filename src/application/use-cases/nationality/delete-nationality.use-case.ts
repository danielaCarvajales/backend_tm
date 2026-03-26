import { Inject, Injectable } from '@nestjs/common';
import { INationalityRepository } from '../../../domain/repositories/nationality.repository';
import { NATIONALITY_REPOSITORY } from '../../tokens/nationality.repository.token';

@Injectable()
export class DeleteNationalityUseCase {
  constructor(
    @Inject(NATIONALITY_REPOSITORY)
    private readonly repository: INationalityRepository,
  ) {}

  async execute(idNacionality: number): Promise<void> {
    const existing = await this.repository.findById(idNacionality);
    if (!existing) {
      throw new Error('NATIONALITY_NOT_FOUND');
    }
    await this.repository.delete(idNacionality);
  }
}
