import { Inject, Injectable } from '@nestjs/common';
import { CasePerson } from '../../../domain/entities/case-person.entity';
import {ExistingPersonInCase,ICasePersonRepository,} from '../../../domain/repositories/case-person.repository';
import { IFamilyRelationshipRepository } from '../../../domain/repositories/family-relationship.repository';
import { IPersonRepository } from '../../../domain/repositories/person.repository';
import { CreateCasePersonDto } from '../../dto/case-person/create-case-person.dto';
import { CASE_PERSON_REPOSITORY } from '../../tokens/case-person.repository.token';
import { FAMILY_RELATIONSHIP_REPOSITORY } from '../../tokens/family-relationship.repository.token';
import { PERSON_REPOSITORY } from '../../tokens/person.repository.token';
import { nowColombia } from '../../../infrastructure/utils/date.util';

const ACTIVE_STATE = 1;

@Injectable()
export class CreateCasePersonUseCase {
  constructor(
    @Inject(CASE_PERSON_REPOSITORY)
    private readonly repository: ICasePersonRepository,
    @Inject(PERSON_REPOSITORY)
    private readonly personRepository: IPersonRepository,
    @Inject(FAMILY_RELATIONSHIP_REPOSITORY)
    private readonly familyRelationshipRepository: IFamilyRelationshipRepository,
  ) {}

  async execute(
    dto: CreateCasePersonDto,
    idCase: number,
  ): Promise<CasePerson | { existingPerson: ExistingPersonInCase }> {
    const person = await this.personRepository.findById(dto.idPerson);
    if (!person) {
      throw new Error('PERSON_NOT_FOUND');
    }

    const familyRelationship = await this.familyRelationshipRepository.findById(
      dto.idFamilyRelationship,
    );
    if (!familyRelationship) {
      throw new Error('FAMILY_RELATIONSHIP_NOT_FOUND');
    }

    if (!dto.forceDuplicate) {
      const existing = await this.repository.findByCaseAndPersonIdentifiers(
        idCase,
        person.fullName,
        person.documentNumber,
        person.idTypeDocument,
      );
      if (existing) {
        return { existingPerson: existing };
      }
    }

    const entity = new CasePerson(
      undefined,
      idCase,
      dto.idPerson,
      dto.idFamilyRelationship,
      ACTIVE_STATE,
      nowColombia(),
      dto.observation?.trim() ?? null,
    );
    return this.repository.save(entity);
  }
}
