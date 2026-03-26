import { Inject, Injectable } from '@nestjs/common';
import { FamilyRelationship } from '../../../domain/entities/family-relationship.entity';
import { IFamilyRelationshipRepository } from '../../../domain/repositories/family-relationship.repository';
import { FAMILY_RELATIONSHIP_REPOSITORY } from '../../tokens/family-relationship.repository.token';

@Injectable()
export class GetFamilyRelationshipByIdUseCase {
  constructor(
    @Inject(FAMILY_RELATIONSHIP_REPOSITORY)
    private readonly repository: IFamilyRelationshipRepository,
  ) {}

  async execute(
    idFamilyRelationship: number,
  ): Promise<FamilyRelationship | null> {
    return this.repository.findById(idFamilyRelationship);
  }
}
