import { Inject, Injectable } from '@nestjs/common';
import { Nationality } from '../../../domain/entities/nationality.entity';
import { INationalityRepository } from '../../../domain/repositories/nationality.repository';
import { NATIONALITY_REPOSITORY } from '../../tokens/nationality.repository.token';

@Injectable()
export class GetNationalityByIdUseCase {
  constructor(
    @Inject(NATIONALITY_REPOSITORY)
    private readonly repository: INationalityRepository,
  ) {}

  async execute(idNacionality: number): Promise<Nationality | null> {
    return this.repository.findById(idNacionality);
  }
}
