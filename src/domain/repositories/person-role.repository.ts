import { PersonRole } from '../entities/person-role.entity';

export interface PersonRoleWithRole extends PersonRole {
  roleName?: string;
}

export interface PersonRolePaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PersonRoleListQuery {
  page: number;
  pageSize: number;
  idPerson?: number;
  codeCompany?: number;
  search?: string;
}

export interface ActivePersonRole {
  idPersonRole: number;
  roleName: string;
}

export interface IPersonRoleRepository {
  save(entity: PersonRole): Promise<PersonRole>;
  update(entity: PersonRole): Promise<PersonRole>;
  delete(idPersonRole: number): Promise<void>;
  findById(idPersonRole: number): Promise<PersonRole | null>;
  findActiveRoleName(idPerson: number, codeCompany: number): Promise<string | null>;
  findActivePersonRole(idPerson: number, codeCompany: number): Promise<ActivePersonRole | null>;
  findPaginated(
    query: PersonRoleListQuery,
  ): Promise<PersonRolePaginatedResult<PersonRoleWithRole>>;
}
