import { Document } from '../entities/document.entity';

export interface PaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface DocumentListQuery {
  page: number;
  pageSize: number;
  search?: string;
}

export interface IDocumentRepository {
  save(entity: Document): Promise<Document>;
  update(entity: Document): Promise<Document>;
  delete(idDocument: number): Promise<void>;
  findById(idDocument: number): Promise<Document | null>;
  findPaginated(query: DocumentListQuery): Promise<PaginatedResult<Document>>;
}
