import { FamilyRelationship } from '../entities/family-relationship.entity';

export interface FamilyRelationshipPaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FamilyRelationshipListQuery {
  page: number;
  pageSize: number;
  search?: string;
}

export interface IFamilyRelationshipRepository {
  save(entity: FamilyRelationship): Promise<FamilyRelationship>;
  update(entity: FamilyRelationship): Promise<FamilyRelationship>;
  delete(idFamilyRelationship: number): Promise<void>;
  findById(idFamilyRelationship: number): Promise<FamilyRelationship | null>;
  findByName(nameFamilyRelationship: string): Promise<FamilyRelationship | null>;
  findPaginated(
    query: FamilyRelationshipListQuery,
  ): Promise<FamilyRelationshipPaginatedResult<FamilyRelationship>>;
  countCasePersonsByFamilyRelationshipId(
    idFamilyRelationship: number,
  ): Promise<number>;
}
