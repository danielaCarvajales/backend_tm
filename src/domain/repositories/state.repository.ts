import { State } from '../entities/state.entity';

// Paginated result structure for list operations.
export interface StatePaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Query criteria for paginated listing.
export interface StateListQuery {
  page: number;
  pageSize: number;
  search?: string;
}

// State Repository
export interface IStateRepository {
  save(entity: State): Promise<State>;
  update(entity: State): Promise<State>;
  delete(idState: number): Promise<void>;
  findById(idState: number): Promise<State | null>;
  findPaginated(query: StateListQuery): Promise<StatePaginatedResult<State>>;
}
