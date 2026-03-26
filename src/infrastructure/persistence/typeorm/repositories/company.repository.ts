import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Company } from '../../../../domain/entities/company.entity';
import {
  ICompanyRepository,
  CompanyListQuery,
  CompanyPaginatedResult,
} from '../../../../domain/repositories/company.repository';
import { Company as CompanyOrm } from '../entities/company/company';
import { CompanyMapper } from '../mappers/company.mapper';

@Injectable()
export class CompanyTypeOrmRepository implements ICompanyRepository {
  private readonly repository: Repository<CompanyOrm>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(CompanyOrm);
  }

  // Saves a new Company entity.
  async save(entity: Company): Promise<Company> {
    const orm = CompanyMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return CompanyMapper.toDomain(saved);
  }

  // Updates an existing Company entity.
  async update(entity: Company): Promise<Company> {
    const orm = CompanyMapper.toOrm(entity);
    const updated = await this.repository.save(orm);
    return CompanyMapper.toDomain(updated);
  }

  // Deletes a Company entity.
  async delete(codeCompany: number): Promise<void> {
    await this.repository.delete(codeCompany);
  }

  // Finds a Company entity by its ID.
  async findById(codeCompany: number): Promise<Company | null> {
    const orm = await this.repository.findOne({
      where: { codeCompany },
    });
    return orm ? CompanyMapper.toDomain(orm) : null;
  }

  // Finds paginated Company entities.
  async findPaginated(query: CompanyListQuery): Promise<CompanyPaginatedResult<Company>> {
    const { page, pageSize, search } = query;
    const skip = (page - 1) * pageSize;

    const qb = this.repository
      .createQueryBuilder('c')
      .select(['c.codeCompany', 'c.nameCompany', 'c.prefixCompany', 'c.stateCompany']);

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      qb.andWhere('(c.nameCompany LIKE :term OR c.prefixCompany LIKE :term)', { term });
    }

    const [items, totalItems] = await qb
      .orderBy('c.nameCompany', 'ASC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((orm) => CompanyMapper.toDomain(orm)),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
