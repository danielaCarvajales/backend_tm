import { CustomerProfile } from '../entities/customer-profile.entity';

export interface CustomerProfilePaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CustomerProfileListQuery {
  page: number;
  pageSize: number;
  search?: string;
}

export interface ClientProfileFull {
  idCustomerProfile: number;
  codeCustomer: string;
  createdAt: Date;
  idPersonRole: number;
  person: {
    idPerson: number;
    fullName: string;
    email: string;
    phone: string;
    documentNumber: string;
  };
  company: {
    codeCompany: number;
    nameCompany: string;
    prefixCompany: string;
  };
  role: {
    idRole: number;
    name: string;
  };
}

export interface ICustomerProfileRepository {
  save(entity: CustomerProfile): Promise<CustomerProfile>;
  update(entity: CustomerProfile): Promise<CustomerProfile>;
  delete(idCustomerProfile: number): Promise<void>;
  findById(idCustomerProfile: number): Promise<CustomerProfile | null>;
  findByCodeCustomer(codeCustomer: string): Promise<CustomerProfile | null>;
  findByIdPersonRole(idPersonRole: number): Promise<CustomerProfile | null>;
  findFullProfileByIdPersonRole(idPersonRole: number): Promise<ClientProfileFull | null>;
  findPaginated(
    query: CustomerProfileListQuery,
  ): Promise<CustomerProfilePaginatedResult<CustomerProfile>>;
}
