import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Role } from '../../../../domain/entities/role.entity';
import {
  IRoleRepository,
  RoleListQuery,
  RolePaginatedResult,
} from '../../../../domain/repositories/role.repository';
import { Role as RoleOrm } from '../entities/role/role';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class RoleTypeOrmRepository implements IRoleRepository {
  private readonly repository: Repository<RoleOrm>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(RoleOrm);
  }

  // Save a new role.
  async save(entity: Role): Promise<Role> {
    const orm = RoleMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return RoleMapper.toDomain(saved);
  }

  // Update a role.
  async update(entity: Role): Promise<Role> {
    const orm = RoleMapper.toOrm(entity);
    const updated = await this.repository.save(orm);
    return RoleMapper.toDomain(updated);
  }

  // Delete a role.
  async delete(idRole: number): Promise<void> {
    await this.repository.delete(idRole);
  }

  // Find a role by id.
  async findById(idRole: number): Promise<Role | null> {
    const orm = await this.repository.findOne({ where: { idRole } });
    return orm ? RoleMapper.toDomain(orm) : null;
  }

  // Find a role by name.
  async findByName(name: string): Promise<Role | null> {
    const orm = await this.repository.findOne({
      where: { name },
    });
    return orm ? RoleMapper.toDomain(orm) : null;
  }

  // Find paginated roles.
  async findPaginated(query: RoleListQuery): Promise<RolePaginatedResult<Role>> {
    const { page, pageSize, search } = query;
    const skip = (page - 1) * pageSize;

    const qb = this.repository.createQueryBuilder('r').select(['r.idRole', 'r.name']);

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      qb.andWhere('r.name LIKE :term', { term });
    }

    const [items, totalItems] = await qb
      .orderBy('r.name', 'ASC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((orm) => RoleMapper.toDomain(orm)),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
