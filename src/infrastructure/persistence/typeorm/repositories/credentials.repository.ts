import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Credentials } from '../../../../domain/entities/credentials.entity';
import {ICredentialsRepository,CredentialsListQuery,CredentialsPaginatedResult} from '../../../../domain/repositories/credentials.repository';
import { Credentials as CredentialsOrm } from '../entities/credentials/credentials';
import { CredentialsMapper } from '../mappers/credentials.mapper';

@Injectable()
export class CredentialsTypeOrmRepository implements ICredentialsRepository {
  private readonly repository: Repository<CredentialsOrm>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(CredentialsOrm);
  }

  // Saves a new Credentials entity.
  async save(entity: Credentials): Promise<Credentials> {
    const orm = CredentialsMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return CredentialsMapper.toDomain(saved);
  }

  // Updates an existing Credentials entity.
  async update(entity: Credentials): Promise<Credentials> {
    const orm = CredentialsMapper.toOrm(entity);
    const updated = await this.repository.save(orm);
    return CredentialsMapper.toDomain(updated);
  }

  // Deletes a Credentials entity.
  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  // Finds Credentials by ID.
  async findById(id: number): Promise<Credentials | null> {
    const orm = await this.repository.findOne({
      where: { id },
    });
    return orm ? CredentialsMapper.toDomain(orm) : null;
  }

  // Finds Credentials by username and codeCompany.
  async findByUsernameAndCompany(username: string, codeCompany: number): Promise<Credentials | null> {
    const orm = await this.repository.findOne({
      where: { username, codeCompany },
    });
    return orm ? CredentialsMapper.toDomain(orm) : null;
  }

  // Finds paginated Credentials.
  async findPaginated(query: CredentialsListQuery): Promise<CredentialsPaginatedResult<Credentials>> {
    const { page, pageSize, search } = query;
    const skip = (page - 1) * pageSize;

    const qb = this.repository
      .createQueryBuilder('c')
      .select([
        'c.id',
        'c.username',
        'c.password',
        'c.state',
        'c.lastAccess',
        'c.idPerson',
        'c.codeCompany',
        'c.failedAttempts',
        'c.accountLockedUntil',
      ]);

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      qb.andWhere('c.username LIKE :term', { term });
    }

    const [items, totalItems] = await qb
      .orderBy('c.username', 'ASC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((orm) => CredentialsMapper.toDomain(orm)),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
