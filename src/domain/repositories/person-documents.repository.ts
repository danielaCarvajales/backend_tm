import { PersonDocuments } from '../entities/person-documents.entity';

export interface PersonDocumentsDocumentView {
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

export interface PersonDocumentsWithRelations {
  idPersonDocuments: number;
  idPerson: number;
  idDocument: number;
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
  document: PersonDocumentsDocumentView;
}

export interface PersonDocumentsListQuery {
  page: number;
  pageSize: number;
  idPerson?: number;
}

export interface PersonDocumentsPaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IPersonDocumentsRepository {
  save(entity: PersonDocuments): Promise<PersonDocuments>;
  update(entity: PersonDocuments): Promise<PersonDocuments>;
  delete(idPersonDocuments: number): Promise<void>;
  findByIdWithRelations(
    idPersonDocuments: number,
  ): Promise<PersonDocumentsWithRelations | null>;
  findByPersonAndDocument(
    idPerson: number,
    idDocument: number,
  ): Promise<PersonDocuments | null>;
  findPaginated(
    query: PersonDocumentsListQuery,
  ): Promise<
    PersonDocumentsPaginatedResult<PersonDocumentsWithRelations>
  >;
}
