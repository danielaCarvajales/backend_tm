import { ServiceCompany } from '../entities/service-company.entity';

export interface ServiceCompanyPaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ServiceCompanyListQuery {
  page: number;
  pageSize: number;
  codeCompany: number;
  search?: string;
}

export interface IServiceCompanyRepository {
  save(entity: ServiceCompany): Promise<ServiceCompany>;
  update(entity: ServiceCompany): Promise<ServiceCompany>;
  delete(idService: number): Promise<void>;
  findById(idService: number): Promise<ServiceCompany | null>;
  findByCodeCompanyAndId(
    idService: number,
    codeCompany: number,
  ): Promise<ServiceCompany | null>;
  findPaginated(
    query: ServiceCompanyListQuery,
  ): Promise<ServiceCompanyPaginatedResult<ServiceCompany>>;
}
