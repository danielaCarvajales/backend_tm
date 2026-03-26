import { Company } from '../entities/company.entity';

// Paginated result structure for list operations.
export interface CompanyPaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Query criteria for paginated listing.
export interface CompanyListQuery {
  page: number;
  pageSize: number;
  search?: string;
}

// Company Repository
export interface ICompanyRepository {
  save(entity: Company): Promise<Company>;
  update(entity: Company): Promise<Company>;
  delete(codeCompany: number): Promise<void>;
  findById(codeCompany: number): Promise<Company | null>;
  findPaginated(query: CompanyListQuery): Promise<CompanyPaginatedResult<Company>>;
}
