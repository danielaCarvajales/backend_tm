import { StateCase } from '../entities/state-case.entity';

export interface StateCasePaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface StateCaseListQuery {
  page: number;
  pageSize: number;
  search?: string;
}

export interface IStateCaseRepository {
  save(entity: StateCase): Promise<StateCase>;
  update(entity: StateCase): Promise<StateCase>;
  delete(idState: number): Promise<void>;
  findById(idState: number): Promise<StateCase | null>;
  findByName(nameState: string): Promise<StateCase | null>;
  findPaginated(query: StateCaseListQuery): Promise<StateCasePaginatedResult<StateCase>>;
  countCaseRecordsByStateId(idState: number): Promise<number>;
}
