import { CasePerson } from '../entities/case-person.entity';
import type { CaseRecordContractItem } from './case-record.repository';

export interface CasePersonWithRelations {
  idCasePerson: number;
  idCase: number;
  idPerson: number;
  idFamilyRelationship: number;
  statePerson: number;
  createdAt: Date;
  observation: string | null;
  person: {
    idPerson: number;
    fullName: string;
    documentNumber: string;
    idTypeDocument: number;
    email: string;
    phone: string;
    birthdate: Date;
    typeDocument: {
      idTypeDocument: number;
      nameTypeDocument: string;
    };
    nationality: {
      idNationality: number;
      nameNationality: string;
    };
  };
  familyRelationship: {
    idFamilyRelationship: number;
    nameFamilyRelationship: string;
  };
  /** Contratos del caso al que pertenece la persona. */
  contracts: CaseRecordContractItem[];
}

export interface ExistingPersonInCase {
  idCasePerson: number;
  idPerson: number;
  fullName: string;
  documentNumber: string;
  idTypeDocument: number;
  familyRelationship: string;
}

export interface CasePersonListQuery {
  page: number;
  pageSize: number;
  idCase: number;
}

export interface CasePersonPaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ICasePersonRepository {
  save(entity: CasePerson): Promise<CasePerson>;
  update(entity: CasePerson): Promise<CasePerson>;
  delete(idCasePerson: number): Promise<void>;
  findById(idCasePerson: number): Promise<CasePerson | null>;
  findByIdWithRelations(
    idCasePerson: number,
  ): Promise<CasePersonWithRelations | null>;
  findByCaseAndId(
    idCase: number,
    idCasePerson: number,
  ): Promise<CasePersonWithRelations | null>;
  findByCaseAndPersonIdentifiers(
    idCase: number,
    fullName: string,
    documentNumber: string,
    idTypeDocument: number,
  ): Promise<ExistingPersonInCase | null>;
  findPaginated(
    query: CasePersonListQuery,
  ): Promise<CasePersonPaginatedResult<CasePersonWithRelations>>;
}
