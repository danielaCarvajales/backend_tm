import { Inject, Injectable } from '@nestjs/common';
import { ICasePersonRepository } from '../../../domain/repositories/case-person.repository';
import { CASE_PERSON_REPOSITORY } from '../../tokens/case-person.repository.token';

@Injectable()
export class DeleteCasePersonUseCase {
  constructor(
    @Inject(CASE_PERSON_REPOSITORY)
    private readonly repository: ICasePersonRepository,
  ) {}

  async execute(idCasePerson: number): Promise<void> {
    const existing = await this.repository.findByIdWithRelations(idCasePerson);
    if (!existing) {
      throw new Error('CASE_PERSON_NOT_FOUND');
    }
    await this.repository.delete(idCasePerson);
  }
}
