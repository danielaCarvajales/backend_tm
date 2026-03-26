import { Role } from '../entities/role.entity';

export interface RolePaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface RoleListQuery {
  page: number;
  pageSize: number;
  search?: string;
}

export interface IRoleRepository {
  save(entity: Role): Promise<Role>;
  update(entity: Role): Promise<Role>;
  delete(idRole: number): Promise<void>;
  findById(idRole: number): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findPaginated(query: RoleListQuery): Promise<RolePaginatedResult<Role>>;
}
