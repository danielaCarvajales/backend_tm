import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { State } from '../../../../domain/entities/state.entity';
import {
  IStateRepository,
  StateListQuery,
  StatePaginatedResult,
} from '../../../../domain/repositories/state.repository';
import { State as StateOrm } from '../entities/state/state';
import { StateMapper } from '../mappers/state.mapper';

@Injectable()
export class StateTypeOrmRepository implements IStateRepository {
  private readonly repository: Repository<StateOrm>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(StateOrm);
  }

  // Saves a new State entity.
  async save(entity: State): Promise<State> {
    const orm = StateMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return StateMapper.toDomain(saved);
  }

  // Updates an existing State entity.
  async update(entity: State): Promise<State> {
    const orm = StateMapper.toOrm(entity);
    const updated = await this.repository.save(orm);
    return StateMapper.toDomain(updated);
  }

  // Deletes State entity.
  async delete(idState: number): Promise<void> {
    await this.repository.delete(idState);
  }

  // Finds a State entity by its ID.
  async findById(idState: number): Promise<State | null> {
    const orm = await this.repository.findOne({
      where: { idState },
    });
    return orm ? StateMapper.toDomain(orm) : null;
  }

  // Finds paginated State entities.
  async findPaginated(query: StateListQuery): Promise<StatePaginatedResult<State>> {
    const { page, pageSize, search } = query;
    const skip = (page - 1) * pageSize;

    const qb = this.repository
      .createQueryBuilder('s')
      .select(['s.idState', 's.nameState']);

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      qb.andWhere('s.nameState LIKE :term', { term });
    }

    const [items, totalItems] = await qb
      .orderBy('s.nameState', 'ASC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((orm) => StateMapper.toDomain(orm)),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
