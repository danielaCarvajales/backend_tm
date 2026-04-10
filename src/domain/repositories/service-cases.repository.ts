import { ServiceCases } from '../entities/service-cases.entity';
import type { CaseRecordContractItem } from './case-record.repository';

export interface ServiceCasesWithRelations {
  idServiceCases: number;
  idCase: number;
  idServices: number;
  observation: string | null;
  createdAt: Date;
  serviceCompany: {
    idService: number;
    name: string;
    description: string;
  };
  caseRecord: {
    idCase: number;
    caseCode: string;
  };
  contracts: CaseRecordContractItem[];
}

export interface ServiceCasesListQuery {
  page: number;
  pageSize: number;
  idCase: number;
}

export interface ServiceCasesPaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IServiceCasesRepository {
  save(entity: ServiceCases): Promise<ServiceCases>;
  update(entity: ServiceCases): Promise<ServiceCases>;
  delete(idServiceCases: number): Promise<void>;
  findById(idServiceCases: number): Promise<ServiceCases | null>;
  findByCaseAndId(idCase: number, idServiceCases: number): Promise<ServiceCases | null>;
  findByCaseAndIdWithRelations(
    idCase: number,
    idServiceCases: number,
  ): Promise<ServiceCasesWithRelations | null>;
  findByCaseAndService(idCase: number, idService: number): Promise<ServiceCases | null>;
  findPaginated(
    query: ServiceCasesListQuery,
  ): Promise<ServiceCasesPaginatedResult<ServiceCases>>;
  findPaginatedWithRelations(
    query: ServiceCasesListQuery,
  ): Promise<ServiceCasesPaginatedResult<ServiceCasesWithRelations>>;
}
