import { Inject, Injectable } from '@nestjs/common';
import { IPersonRepository } from '../../../domain/repositories/person.repository';
import { PERSON_REPOSITORY } from '../../tokens/person.repository.token';

@Injectable()
export class DeletePersonUseCase {
  constructor(
    @Inject(PERSON_REPOSITORY)
    private readonly repository: IPersonRepository,
  ) {}

  async execute(idPerson: number): Promise<void> {
    const existing = await this.repository.findById(idPerson);
    if (!existing) {
      throw new Error('PERSON_NOT_FOUND');
    }
    await this.repository.delete(idPerson);
  }
}
