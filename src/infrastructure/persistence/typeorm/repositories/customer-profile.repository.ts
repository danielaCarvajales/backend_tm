import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CustomerProfile } from '../../../../domain/entities/customer-profile.entity';
import {
  ICustomerProfileRepository,
  CustomerProfileListQuery,
  CustomerProfilePaginatedResult,
  ClientProfileFull,
} from '../../../../domain/repositories/customer-profile.repository';
import { CustomerProfile as CustomerProfileOrm } from '../entities/customer-profile/customer-profile';
import { CustomerProfileMapper } from '../mappers/customer-profile.mapper';

@Injectable()
export class CustomerProfileTypeOrmRepository implements ICustomerProfileRepository {
  private readonly repository: Repository<CustomerProfileOrm>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(CustomerProfileOrm);
  }

  // Save a new customer profile.
  async save(entity: CustomerProfile): Promise<CustomerProfile> {
    const orm = CustomerProfileMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return CustomerProfileMapper.toDomain(saved);
  }

  // Update a customer profile.
  async update(entity: CustomerProfile): Promise<CustomerProfile> {
    const orm = CustomerProfileMapper.toOrm(entity);
    const updated = await this.repository.save(orm);
    return CustomerProfileMapper.toDomain(updated);
  }

  // Delete a customer profile.
  async delete(idCustomerProfile: number): Promise<void> {
    await this.repository.delete(idCustomerProfile);
  }

  // Find a customer profile by id.
  async findById(idCustomerProfile: number): Promise<CustomerProfile | null> {
    const orm = await this.repository.findOne({
      where: { idCustomerProfile },
    });
    return orm ? CustomerProfileMapper.toDomain(orm) : null;
  }

  async findByIdForCompany(
    idCustomerProfile: number,
    codeCompany: number,
  ): Promise<CustomerProfile | null> {
    const orm = await this.repository
      .createQueryBuilder('cp')
      .innerJoin('cp.personRole', 'pr')
      .where('cp.idCustomerProfile = :id', { id: idCustomerProfile })
      .andWhere('pr.codeCompany = :codeCompany', { codeCompany })
      .getOne();
    return orm ? CustomerProfileMapper.toDomain(orm) : null;
  }

  // Find a customer profile by code.
  async findByCodeCustomer(codeCustomer: string): Promise<CustomerProfile | null> {
    const orm = await this.repository.findOne({
      where: { codeCustomer },
    });
    return orm ? CustomerProfileMapper.toDomain(orm) : null;
  }

  // Find a customer profile by id person role.
  async findByIdPersonRole(idPersonRole: number): Promise<CustomerProfile | null> {
    const orm = await this.repository.findOne({
      where: { idPersonRole },
    });
    return orm ? CustomerProfileMapper.toDomain(orm) : null;
  }

  // Find a full profile by id person role.
  async findFullProfileByIdPersonRole(
    idPersonRole: number,
  ): Promise<ClientProfileFull | null> {
    const result = await this.repository
      .createQueryBuilder('cp')
      .innerJoinAndSelect('cp.personRole', 'pr')
      .innerJoinAndSelect('pr.person', 'p')
      .innerJoinAndSelect('pr.company', 'c')
      .innerJoinAndSelect('pr.role', 'r')
      .where('cp.idPersonRole = :idPersonRole', { idPersonRole })
      .getOne();

    if (!result?.personRole) return null;

    const pr = result.personRole;
    return {
      idCustomerProfile: result.idCustomerProfile,
      codeCustomer: result.codeCustomer,
      createdAt: result.createdAt,
      idPersonRole: result.idPersonRole,
      person: {
        idPerson: pr.person?.idPerson ?? 0,
        fullName: pr.person?.fullName ?? '',
        email: pr.person?.email ?? '',
        phone: pr.person?.phone ?? '',
        documentNumber: pr.person?.documentNumber ?? '',
      },
      company: {
        codeCompany: pr.company?.codeCompany ?? 0,
        nameCompany: pr.company?.nameCompany ?? '',
        prefixCompany: pr.company?.prefixCompany ?? '',
      },
      role: {
        idRole: pr.role?.idRole ?? 0,
        name: pr.role?.name ?? '',
      },
    };
  }

  // Find paginated customer profiles.
  async findPaginated(
    query: CustomerProfileListQuery,
  ): Promise<CustomerProfilePaginatedResult<CustomerProfile>> {
    const { page, pageSize, search, codeCompany } = query;
    const skip = (page - 1) * pageSize;

    const qb = this.repository
      .createQueryBuilder('cp')
      .select([
        'cp.idCustomerProfile',
        'cp.idPersonRole',
        'cp.codeCustomer',
        'cp.createdAt',
      ]);

    if (codeCompany !== undefined) {
      qb.innerJoin('cp.personRole', 'pr').andWhere(
        'pr.codeCompany = :codeCompany',
        { codeCompany },
      );
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      qb.andWhere('cp.codeCustomer LIKE :term', { term });
    }

    const [items, totalItems] = await qb
      .orderBy('cp.codeCustomer', 'ASC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((orm) => CustomerProfileMapper.toDomain(orm)),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
