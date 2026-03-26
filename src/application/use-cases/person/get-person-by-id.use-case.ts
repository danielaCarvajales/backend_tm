import { Inject, Injectable } from '@nestjs/common';
import {
  IPersonRepository,
  PersonWithRelations,
} from '../../../domain/repositories/person.repository';
import { PERSON_REPOSITORY } from '../../tokens/person.repository.token';

@Injectable()
export class GetPersonByIdUseCase {
  constructor(
    @Inject(PERSON_REPOSITORY)
    private readonly repository: IPersonRepository,
  ) {}

  async execute(idPerson: number): Promise<PersonWithRelations | null> {
    return this.repository.findByIdWithRelations(idPerson);
  }
}
