import { Credentials } from '../entities/credentials.entity';

// Paginated result structure for list operations.
export interface CredentialsPaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CredentialsListQuery {
  page: number;
  pageSize: number;
  search?: string;
}

export interface ICredentialsRepository {
  save(entity: Credentials): Promise<Credentials>;
  update(entity: Credentials): Promise<Credentials>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<Credentials | null>;
  findByUsernameAndCompany(username: string, codeCompany: number): Promise<Credentials | null>;
  /** First match when the same email/username may exist across companies. */
  findByUsernameCaseInsensitive(username: string): Promise<Credentials | null>;
  findPaginated(query: CredentialsListQuery): Promise<CredentialsPaginatedResult<Credentials>>;
}
