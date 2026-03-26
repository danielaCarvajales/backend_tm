import { Inject, Injectable } from '@nestjs/common';
import { Nationality } from '../../../domain/entities/nationality.entity';
import { INationalityRepository } from '../../../domain/repositories/nationality.repository';
import { CreateNationalityDto } from '../../dto/nationality/create-nationality.dto';
import { NATIONALITY_REPOSITORY } from '../../tokens/nationality.repository.token';

@Injectable()
export class CreateNationalityUseCase {
  constructor(
    @Inject(NATIONALITY_REPOSITORY)
    private readonly repository: INationalityRepository,
  ) {}

  async execute(dto: CreateNationalityDto): Promise<Nationality> {
    const entity = new Nationality(undefined, dto.name, dto.abbreviation);
    return this.repository.save(entity);
  }
}
