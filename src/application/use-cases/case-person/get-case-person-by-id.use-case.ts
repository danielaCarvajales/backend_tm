import { Inject, Injectable } from '@nestjs/common';
import {CasePersonWithRelations, ICasePersonRepository} from '../../../domain/repositories/case-person.repository';
import { CASE_PERSON_REPOSITORY } from '../../tokens/case-person.repository.token';

@Injectable()
export class GetCasePersonByIdUseCase {
  constructor(
    @Inject(CASE_PERSON_REPOSITORY)
    private readonly repository: ICasePersonRepository,
  ) {}

  async execute(
    idCasePerson: number,
  ): Promise<CasePersonWithRelations | null> {
    return this.repository.findByIdWithRelations(idCasePerson);
  }
}
