import { Contract } from '../entities/contract.entity';

export interface ContractWithRelations {
  idContract: number;
  contractCode: string;
  idCase: number;
  digitalSignature: string | null;
  createdAt: Date;
  caseRecord: {
    idCase: number;
    caseCode: string;
    holder: number;
    agent: number | null;
    codeCompany: number;
    idStateCase: number;
    createdAt: Date;
    closingDate: Date | null;
    stateCase: {
      idState: number;
      nameState: string;
    };
    company: {
      codeCompany: number;
      nameCompany: string;
      prefixCompany: string;
    };
  };
}

export interface ContractListQuery {
  page: number;
  pageSize: number;
  idCase?: number;
}

export interface ContractPaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IContractRepository {
  save(entity: Contract): Promise<Contract>;
  update(entity: Contract): Promise<void>;
  delete(idContract: number): Promise<void>;
  findById(idContract: number): Promise<Contract | null>;
  findByIdWithRelations(
    idContract: number,
  ): Promise<ContractWithRelations | null>;
  findByContractCode(contractCode: string): Promise<Contract | null>;
  findPaginated(
    query: ContractListQuery,
  ): Promise<ContractPaginatedResult<ContractWithRelations>>;
}
