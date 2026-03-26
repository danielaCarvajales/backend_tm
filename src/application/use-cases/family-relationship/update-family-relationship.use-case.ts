import { Inject, Injectable } from '@nestjs/common';
import { FamilyRelationship } from '../../../domain/entities/family-relationship.entity';
import { IFamilyRelationshipRepository } from '../../../domain/repositories/family-relationship.repository';
import { UpdateFamilyRelationshipDto } from '../../dto/family-relationship/update-family-relationship.dto';
import { FAMILY_RELATIONSHIP_REPOSITORY } from '../../tokens/family-relationship.repository.token';

@Injectable()
export class UpdateFamilyRelationshipUseCase {
  constructor(
    @Inject(FAMILY_RELATIONSHIP_REPOSITORY)
    private readonly repository: IFamilyRelationshipRepository,
  ) {}

  async execute(
    idFamilyRelationship: number,
    dto: UpdateFamilyRelationshipDto,
  ): Promise<FamilyRelationship> {
    const existing = await this.repository.findById(idFamilyRelationship);
    if (!existing) {
      throw new Error('FAMILY_RELATIONSHIP_NOT_FOUND');
    }
    if (
      dto.nameFamilyRelationship !== undefined &&
      dto.nameFamilyRelationship.trim() !== existing.nameFamilyRelationship
    ) {
      const duplicate = await this.repository.findByName(
        dto.nameFamilyRelationship.trim(),
      );
      if (
        duplicate &&
        duplicate.idFamilyRelationship !== idFamilyRelationship
      ) {
        throw new Error('FAMILY_RELATIONSHIP_NAME_ALREADY_EXISTS');
      }
    }
    const updated = new FamilyRelationship(
      idFamilyRelationship,
      dto.nameFamilyRelationship?.trim() ?? existing.nameFamilyRelationship,
    );
    return this.repository.update(updated);
  }
}
