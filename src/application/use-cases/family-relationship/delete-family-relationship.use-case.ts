import { Inject, Injectable } from '@nestjs/common';
import { IFamilyRelationshipRepository } from '../../../domain/repositories/family-relationship.repository';
import { FAMILY_RELATIONSHIP_REPOSITORY } from '../../tokens/family-relationship.repository.token';

@Injectable()
export class DeleteFamilyRelationshipUseCase {
  constructor(
    @Inject(FAMILY_RELATIONSHIP_REPOSITORY)
    private readonly repository: IFamilyRelationshipRepository,
  ) {}

  async execute(idFamilyRelationship: number): Promise<void> {
    const existing = await this.repository.findById(idFamilyRelationship);
    if (!existing) {
      throw new Error('FAMILY_RELATIONSHIP_NOT_FOUND');
    }
    const usageCount =
      await this.repository.countCasePersonsByFamilyRelationshipId(
        idFamilyRelationship,
      );
    if (usageCount > 0) {
      throw new Error('FAMILY_RELATIONSHIP_IN_USE');
    }
    await this.repository.delete(idFamilyRelationship);
  }
}
