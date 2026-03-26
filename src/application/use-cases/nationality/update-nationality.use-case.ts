import { Inject, Injectable } from '@nestjs/common';
import { Nationality } from '../../../domain/entities/nationality.entity';
import { INationalityRepository } from '../../../domain/repositories/nationality.repository';
import { UpdateNationalityDto } from '../../dto/nationality/update-nationality.dto';
import { NATIONALITY_REPOSITORY } from '../../tokens/nationality.repository.token';

@Injectable()
export class UpdateNationalityUseCase {
  constructor(
    @Inject(NATIONALITY_REPOSITORY)
    private readonly repository: INationalityRepository,
  ) {}

  async execute(idNacionality: number, dto: UpdateNationalityDto): Promise<Nationality> {
    const existing = await this.repository.findById(idNacionality);
    if (!existing) {
      throw new Error('NATIONALITY_NOT_FOUND');
    }
    const updated = new Nationality(
      idNacionality,
      dto.name ?? existing.name,
      dto.abbreviation ?? existing.abbreviation,
    );
    return this.repository.update(updated);
  }
}
