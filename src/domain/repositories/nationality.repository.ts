import { Nationality } from '../entities/nationality.entity';

// Paginated result structure for list operations.
export interface NationalityPaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Query criteria for paginated listing.
export interface NationalityListQuery {
  page: number;
  pageSize: number;
  search?: string;
}

// Nationality Repository
export interface INationalityRepository {
  save(entity: Nationality): Promise<Nationality>;
  update(entity: Nationality): Promise<Nationality>;
  delete(idNacionality: number): Promise<void>;
  findById(idNacionality: number): Promise<Nationality | null>;
  findPaginated(query: NationalityListQuery): Promise<NationalityPaginatedResult<Nationality>>;
}
