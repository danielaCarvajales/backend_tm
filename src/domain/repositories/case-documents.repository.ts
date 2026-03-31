import { CaseDocuments } from '../entities/case-documents.entity';

export interface CaseDocumentsDocumentView {
  idDocument: number;
  nameFileDocument: string;
  descriptionDocument: string | null;
  urlDocument: string;
  mimeType: string;
  idTypeDocument: number | null;
  createdAtDocument: Date;
  typeDocument: {
    idTypeDocument: number;
    nameTypeDocument: string;
  } | null;
}

export interface CaseDocumentsWithRelations {
  idCaseDocuments: number;
  idCase: number;
  idDocument: number;
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
  document: CaseDocumentsDocumentView;
}

export interface CaseDocumentsListQuery {
  page: number;
  pageSize: number;
  idCase?: number;
}

export interface CaseDocumentsPaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ICaseDocumentsRepository {
  save(entity: CaseDocuments): Promise<CaseDocuments>;
  update(entity: CaseDocuments): Promise<CaseDocuments>;
  delete(idCaseDocuments: number): Promise<void>;
  findByIdWithRelations(
    idCaseDocuments: number,
  ): Promise<CaseDocumentsWithRelations | null>;
  findByCaseAndDocument(
    idCase: number,
    idDocument: number,
  ): Promise<CaseDocuments | null>;
  findPaginated(
    query: CaseDocumentsListQuery,
  ): Promise<CaseDocumentsPaginatedResult<CaseDocumentsWithRelations>>;
}
