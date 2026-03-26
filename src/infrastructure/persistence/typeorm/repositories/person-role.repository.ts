import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PersonRole } from '../../../../domain/entities/person-role.entity';
import {IPersonRoleRepository, PersonRoleListQuery, PersonRolePaginatedResult, PersonRoleWithRole} from '../../../../domain/repositories/person-role.repository';
import { PersonRole as PersonRoleOrm } from '../entities/person-role/person-role';
import { PersonRoleMapper } from '../mappers/person-role.mapper';

@Injectable()
export class PersonRoleTypeOrmRepository implements IPersonRoleRepository {
  private readonly repository: Repository<PersonRoleOrm>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(PersonRoleOrm);
  }

  // Save a new person role.
  async save(entity: PersonRole): Promise<PersonRole> {
    const orm = PersonRoleMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return PersonRoleMapper.toDomain(saved);
  }

  // Update a person role.
  async update(entity: PersonRole): Promise<PersonRole> {
    const orm = PersonRoleMapper.toOrm(entity);
    const updated = await this.repository.save(orm);
    return PersonRoleMapper.toDomain(updated);
  }

  // Delete a person role.
  async delete(idPersonRole: number): Promise<void> {
    await this.repository.delete(idPersonRole);
  }

  // Find a person role by id.
  async findById(idPersonRole: number): Promise<PersonRole | null> {
    const orm = await this.repository.findOne({ where: { idPersonRole } });
    return orm ? PersonRoleMapper.toDomain(orm) : null;
  }

  // Find an active role name by id person and code company.
  async findActiveRoleName(idPerson: number, codeCompany: number): Promise<string | null> {
    const result = await this.findActivePersonRole(idPerson, codeCompany);
    return result?.roleName ?? null;
  }

  // Find an active person role by id person and code company.
  async findActivePersonRole(
    idPerson: number,
    codeCompany: number,
  ): Promise<{ idPersonRole: number; roleName: string } | null> {
    const result = await this.repository
      .createQueryBuilder('pr')
      .innerJoinAndSelect('pr.role', 'r')
      .where('pr.idPerson = :idPerson', { idPerson })
      .andWhere('pr.codeCompany = :codeCompany', { codeCompany })
      .andWhere('pr.idState = :activeState', { activeState: 1 })
      .andWhere('pr.revocationDate IS NULL')
      .getOne();

    if (!result?.role?.name) return null;
    return { idPersonRole: result.idPersonRole, roleName: result.role.name };
  }

  // Find paginated person roles.
  async findPaginated(
    query: PersonRoleListQuery,
  ): Promise<PersonRolePaginatedResult<PersonRoleWithRole>> {
    const { page, pageSize, idPerson, codeCompany } = query;
    const skip = (page - 1) * pageSize;

    const qb = this.repository
      .createQueryBuilder('pr')
      .leftJoinAndSelect('pr.role', 'r')
      .select([
        'pr.idPersonRole',
        'pr.idPerson',
        'pr.idRole',
        'pr.codeCompany',
        'pr.idState',
        'pr.assignmentDate',
        'pr.revocationDate',
        'r.idRole',
        'r.name',
      ]);

    if (idPerson !== undefined) {
      qb.andWhere('pr.idPerson = :idPerson', { idPerson });
    }
    if (codeCompany !== undefined) {
      qb.andWhere('pr.codeCompany = :codeCompany', { codeCompany });
    }

    const [items, totalItems] = await qb
      .orderBy('pr.assignmentDate', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((orm) => ({
        ...PersonRoleMapper.toDomain(orm),
        roleName: orm.role?.name,
      })),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
