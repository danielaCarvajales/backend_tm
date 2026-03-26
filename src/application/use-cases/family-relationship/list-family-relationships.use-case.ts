import { Inject, Injectable } from '@nestjs/common';
import {
  FamilyRelationshipListQuery,
  FamilyRelationshipPaginatedResult,
} from '../../../domain/repositories/family-relationship.repository';
import { FamilyRelationship } from '../../../domain/entities/family-relationship.entity';
import { IFamilyRelationshipRepository } from '../../../domain/repositories/family-relationship.repository';
import { QueryFamilyRelationshipDto } from '../../dto/family-relationship/query-family-relationship.dto';
import { FAMILY_RELATIONSHIP_REPOSITORY } from '../../tokens/family-relationship.repository.token';

@Injectable()
export class ListFamilyRelationshipsUseCase {
  constructor(
    @Inject(FAMILY_RELATIONSHIP_REPOSITORY)
    private readonly repository: IFamilyRelationshipRepository,
  ) {}

  async execute(
    query: QueryFamilyRelationshipDto,
  ): Promise<FamilyRelationshipPaginatedResult<FamilyRelationship>> {
    const domainQuery: FamilyRelationshipListQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      search: query.search,
    };
    return this.repository.findPaginated(domainQuery);
  }
}
