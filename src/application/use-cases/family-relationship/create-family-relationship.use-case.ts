import { Inject, Injectable } from '@nestjs/common';
import { FamilyRelationship } from '../../../domain/entities/family-relationship.entity';
import { IFamilyRelationshipRepository } from '../../../domain/repositories/family-relationship.repository';
import { CreateFamilyRelationshipDto } from '../../dto/family-relationship/create-family-relationship.dto';
import { FAMILY_RELATIONSHIP_REPOSITORY } from '../../tokens/family-relationship.repository.token';

@Injectable()
export class CreateFamilyRelationshipUseCase {
  constructor(
    @Inject(FAMILY_RELATIONSHIP_REPOSITORY)
    private readonly repository: IFamilyRelationshipRepository,
  ) {}

  async execute(dto: CreateFamilyRelationshipDto): Promise<FamilyRelationship> {
    const existing = await this.repository.findByName(
      dto.nameFamilyRelationship.trim(),
    );
    if (existing) {
      throw new Error('FAMILY_RELATIONSHIP_NAME_ALREADY_EXISTS');
    }
    const entity = new FamilyRelationship(
      undefined,
      dto.nameFamilyRelationship.trim(),
    );
    return this.repository.save(entity);
  }
}
