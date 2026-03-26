import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { StateCase } from '../../../../domain/entities/state-case.entity';
import {IStateCaseRepository, StateCaseListQuery, StateCasePaginatedResult} from '../../../../domain/repositories/state-case.repository';
import { StateCase as StateCaseOrm } from '../entities/state-case/state-case';
import { CaseRecord } from '../entities/case-record/case-record';
import { StateCaseMapper } from '../mappers/state-case.mapper';

@Injectable()
export class StateCaseTypeOrmRepository implements IStateCaseRepository {
  private readonly repository: Repository<StateCaseOrm>;
  private readonly caseRecordRepository: Repository<CaseRecord>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(StateCaseOrm);
    this.caseRecordRepository = this.dataSource.getRepository(CaseRecord);
  }

  // Save a new state case.
  async save(entity: StateCase): Promise<StateCase> {
    const orm = StateCaseMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return StateCaseMapper.toDomain(saved);
  }

  // Update a state case.
  async update(entity: StateCase): Promise<StateCase> {
    const orm = StateCaseMapper.toOrm(entity);
    const updated = await this.repository.save(orm);
    return StateCaseMapper.toDomain(updated);
  }

  // Delete a state case.
  async delete(idState: number): Promise<void> {
    await this.repository.delete(idState);
  }

  // Find a state case by id.
  async findById(idState: number): Promise<StateCase | null> {
    const orm = await this.repository.findOne({
      where: { idState },
    });
    return orm ? StateCaseMapper.toDomain(orm) : null;
  }

  // Find a state case by name.
  async findByName(nameState: string): Promise<StateCase | null> {
    const orm = await this.repository.findOne({
      where: { nameState },
    });
    return orm ? StateCaseMapper.toDomain(orm) : null;
  }

  // Find paginated state cases.
  async findPaginated(
    query: StateCaseListQuery,
  ): Promise<StateCasePaginatedResult<StateCase>> {
    const { page, pageSize, search } = query;
    const skip = (page - 1) * pageSize;

    const qb = this.repository
      .createQueryBuilder('sc')
      .select(['sc.idState', 'sc.nameState']);

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      qb.andWhere('sc.nameState LIKE :term', { term });
    }

    const [items, totalItems] = await qb
      .orderBy('sc.nameState', 'ASC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((orm) => StateCaseMapper.toDomain(orm)),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  // Count case records by state id.
  async countCaseRecordsByStateId(idState: number): Promise<number> {
    return this.caseRecordRepository.count({
      where: { idStateCase: idState },
    });
  }
}
