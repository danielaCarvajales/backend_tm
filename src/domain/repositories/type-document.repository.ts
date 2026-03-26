import { TypeDocument } from '../entities/type-document.entity';

export interface TypeDocumentPaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TypeDocumentListQuery {
  page: number;
  pageSize: number;
  search?: string;
}

export interface ITypeDocumentRepository {
  save(entity: TypeDocument): Promise<TypeDocument>;
  update(entity: TypeDocument): Promise<TypeDocument>;
  delete(idTypeDocument: number): Promise<void>;
  findById(idTypeDocument: number): Promise<TypeDocument | null>;
  findByName(nameTypeDocument: string): Promise<TypeDocument | null>;
  findPaginated(
    query: TypeDocumentListQuery,
  ): Promise<TypeDocumentPaginatedResult<TypeDocument>>;
  countDocumentsByTypeDocumentId(idTypeDocument: number): Promise<number>;
}
