import { Person } from '../entities/person.entity';

// Person with full relations (typeDocument, nationality) for complete display.
export interface PersonWithRelations extends Person {
  typeDocument: {
    idTypeDocument: number;
    nameTypeDocument: string;
  };
  nationality: {
    idNationality: number;
    nameNationality: string;
  };
}

// Paginated result structure for list operations.
export interface PersonPaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Query criteria for paginated listing.
export interface PersonListQuery {
  companyId?: number;
  page: number;
  pageSize: number;
  search?: string;
}

// Person Repository
export interface IPersonRepository {
  save(entity: Person): Promise<Person>;
  update(entity: Person): Promise<Person>;
  delete(idPerson: number, companyId?: number): Promise<void>;
  findById(idPerson: number, companyId?: number): Promise<Person | null>;
  findByIdWithRelations(idPerson: number, companyId?: number): Promise<PersonWithRelations | null>;
  findByPersonCode(personCode: string, companyId?: number): Promise<Person | null>;
  findPaginated(
    query: PersonListQuery,
    companyId?: number,
  ): Promise<PersonPaginatedResult<PersonWithRelations>>;
}
