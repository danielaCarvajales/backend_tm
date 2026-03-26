import { Inject, Injectable } from '@nestjs/common';
import { CasePerson } from '../../../domain/entities/case-person.entity';
import { ICasePersonRepository } from '../../../domain/repositories/case-person.repository';
import { IFamilyRelationshipRepository } from '../../../domain/repositories/family-relationship.repository';
import { UpdateCasePersonDto } from '../../dto/case-person/update-case-person.dto';
import { CASE_PERSON_REPOSITORY } from '../../tokens/case-person.repository.token';
import { FAMILY_RELATIONSHIP_REPOSITORY } from '../../tokens/family-relationship.repository.token';

@Injectable()
export class UpdateCasePersonUseCase {
  constructor(
    @Inject(CASE_PERSON_REPOSITORY)
    private readonly repository: ICasePersonRepository,
    @Inject(FAMILY_RELATIONSHIP_REPOSITORY)
    private readonly familyRelationshipRepository: IFamilyRelationshipRepository,
  ) {}

  async execute(
    idCasePerson: number,
    dto: UpdateCasePersonDto,
    canChangeStatePerson: boolean,
  ): Promise<CasePerson> {
    const existing = await this.repository.findByIdWithRelations(idCasePerson);
    if (!existing) {
      throw new Error('CASE_PERSON_NOT_FOUND');
    }

    if (dto.idFamilyRelationship !== undefined) {
      const familyRelationship =
        await this.familyRelationshipRepository.findById(
          dto.idFamilyRelationship,
        );
      if (!familyRelationship) {
        throw new Error('FAMILY_RELATIONSHIP_NOT_FOUND');
      }
    }

    let statePerson = existing.statePerson;
    if (dto.statePerson !== undefined) {
      if (!canChangeStatePerson) {
        throw new Error('CASE_PERSON_STATE_CHANGE_FORBIDDEN');
      }
      statePerson = dto.statePerson;
    }

    const updated = new CasePerson(
      idCasePerson,
      existing.idCase,
      existing.idPerson,
      dto.idFamilyRelationship ?? existing.idFamilyRelationship,
      statePerson,
      existing.createdAt,
      dto.observation !== undefined ? (dto.observation ?? null) : existing.observation,
    );
    return this.repository.update(updated);
  }
}
