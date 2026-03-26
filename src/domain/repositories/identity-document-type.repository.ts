import { IdentityDocumentType } from '../entities/identity-document-type.entity';

// Paginated result structure for list operations.
export interface PaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Query criteria for paginated listing 
export interface IdentityDocumentTypeListQuery {
  page: number;
  pageSize: number;
  search?: string;
}

// IdentityDocumentType Repository
export interface IIdentityDocumentTypeRepository {
  save(entity: IdentityDocumentType): Promise<IdentityDocumentType>;
  update(entity: IdentityDocumentType): Promise<IdentityDocumentType>;
  delete(idTypeIdentificationDocument: number): Promise<void>;
  findById(idTypeIdentificationDocument: number): Promise<IdentityDocumentType | null>;
  findPaginated(query: IdentityDocumentTypeListQuery): Promise<PaginatedResult<IdentityDocumentType>>;
}
