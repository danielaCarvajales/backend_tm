import { CaseRecord } from '../entities/case-record.entity';

export interface CaseRecordPaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CaseRecordListQuery {
  page: number;
  pageSize: number;
  holderFilter?: number;
  codeCompanyFilter?: number;
  search?: string;
}

export interface CaseRecordServiceItem {
  idServiceCases: number;
  idService: number;
  observations: string | null;
  createdAt: Date;
  serviceName: string;
  serviceDescription: string;
}

export interface CaseRecordPersonItem {
  idCasePerson: number;
  idPerson: number;
  idFamilyRelationship: number;
  statePerson: number;
  createdAt: Date;
  observation: string | null;
  personFullName: string;
  personDocumentNumber: string;
  personIdTypeDocument: number;
  personBirthdate: Date | null;
  personTypeDocument: {
    idTypeDocument: number;
    nameTypeDocument: string;
  } | null;
  personNationality: {
    idNationality: number;
    nameNationality: string;
  } | null;
  familyRelationshipName: string;
}

export interface CaseRecordWithRelations {
  idCase: number;
  caseCode: string;
  holder: number;
  agent: number | null;
  codeCompany: number;
  idStateCase: number;
  createdAt: Date;
  closingDate: Date | null;
  holderPerson: {
    idPerson: number;
    fullName: string;
    email: string;
    phone: string;
    documentNumber: string;
    typeDocument: {
      idTypeDocument: number;
      nameTypeDocument: string;
    };
    nationality: {
      idNationality: number;
      nameNationality: string;
    };
    birthdate: Date;
  };
  agentPerson: {
    idPerson: number;
    fullName: string;
    email: string;
    phone: string;
    documentNumber: string;
    birthdate: Date;
    typeDocument: {
      idTypeDocument: number;
      nameTypeDocument: string;
    };
    nationality: {
      idNationality: number;
      nameNationality: string;
    };
  } | null;
  company: {
    codeCompany: number;
    nameCompany: string;
    prefixCompany: string;
  };
  stateCase: {
    idState: number;
    nameState: string;
  };
  services: CaseRecordServiceItem[];
  persons: CaseRecordPersonItem[];
}

export interface ICaseRecordRepository {
  save(entity: CaseRecord): Promise<CaseRecord>;
  update(entity: CaseRecord): Promise<CaseRecord>;
  delete(idCase: number): Promise<void>;
  findById(idCase: number): Promise<CaseRecord | null>;
  findByCaseCode(caseCode: string): Promise<CaseRecord | null>;
  findByHolderAndCompany(
    holder: number,
    codeCompany: number,
  ): Promise<CaseRecordWithRelations | null>;
  findByIdWithRelations(idCase: number): Promise<CaseRecordWithRelations | null>;
  findPaginated(
    query: CaseRecordListQuery,
  ): Promise<CaseRecordPaginatedResult<CaseRecordWithRelations>>;
}
