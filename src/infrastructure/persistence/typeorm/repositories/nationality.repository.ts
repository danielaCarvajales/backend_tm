import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Nationality } from '../../../../domain/entities/nationality.entity';
import {
  INationalityRepository,
  NationalityListQuery,
  NationalityPaginatedResult,
} from '../../../../domain/repositories/nationality.repository';
import { Nacionality } from '../entities/nacionality/nacionality';
import { NationalityMapper } from '../mappers/nationality.mapper';

@Injectable()
export class NationalityTypeOrmRepository implements INationalityRepository {
  private readonly repository: Repository<Nacionality>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Nacionality);
  }

  // Saves a new Nationality entity.
  async save(entity: Nationality): Promise<Nationality> {
    const orm = NationalityMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return NationalityMapper.toDomain(saved);
  }

  // Updates an existing Nationality entity.
  async update(entity: Nationality): Promise<Nationality> {
    const orm = NationalityMapper.toOrm(entity);
    const updated = await this.repository.save(orm);
    return NationalityMapper.toDomain(updated);
  }

  // Deletes a Nationality entity.
  async delete(idNacionality: number): Promise<void> {
    await this.repository.delete(idNacionality);
  }

  // Finds a Nationality entity by its ID.
  async findById(idNacionality: number): Promise<Nationality | null> {
    const orm = await this.repository.findOne({
      where: { idNacionality },
    });
    return orm ? NationalityMapper.toDomain(orm) : null;
  }

  // Finds paginated Nationality entities.
  async findPaginated(query: NationalityListQuery): Promise<NationalityPaginatedResult<Nationality>> {
    const { page, pageSize, search } = query;
    const skip = (page - 1) * pageSize;

    const qb = this.repository
      .createQueryBuilder('n')
      .select(['n.idNacionality', 'n.name', 'n.abbreviation']);

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      qb.andWhere('(n.name LIKE :term OR n.abbreviation LIKE :term)', { term });
    }

    const [items, totalItems] = await qb
      .orderBy('n.name', 'ASC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((orm) => NationalityMapper.toDomain(orm)),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
