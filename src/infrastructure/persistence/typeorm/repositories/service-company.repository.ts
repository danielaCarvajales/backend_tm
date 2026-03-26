import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ServiceCompany } from '../../../../domain/entities/service-company.entity';
import {
  IServiceCompanyRepository,
  ServiceCompanyListQuery,
  ServiceCompanyPaginatedResult,
} from '../../../../domain/repositories/service-company.repository';
import { ServiceCompany as ServiceCompanyOrm } from '../entities/service-company/service-company';
import { ServiceCompanyMapper } from '../mappers/service-company.mapper';

@Injectable()
export class ServiceCompanyTypeOrmRepository implements IServiceCompanyRepository {
  private readonly repository: Repository<ServiceCompanyOrm>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(ServiceCompanyOrm);
  }

  async save(entity: ServiceCompany): Promise<ServiceCompany> {
    const orm = ServiceCompanyMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return ServiceCompanyMapper.toDomain(saved);
  }

  async update(entity: ServiceCompany): Promise<ServiceCompany> {
    if (entity.idService === undefined) {
      throw new Error('Cannot update entity without id');
    }
    await this.repository.update(
      { idServices: entity.idService },
      {
        name: entity.name,
        description: entity.description,
      },
    );
    const updated = await this.findByCodeCompanyAndId(
      entity.idService,
      entity.codeCompany,
    );
    if (!updated) {
      throw new Error('SERVICE_COMPANY_NOT_FOUND');
    }
    return updated;
  }

  async delete(idService: number): Promise<void> {
    await this.repository.delete({ idServices: idService });
  }

  async findById(idService: number): Promise<ServiceCompany | null> {
    const orm = await this.repository.findOne({
      where: { idServices: idService },
    });
    return orm ? ServiceCompanyMapper.toDomain(orm) : null;
  }

  async findByCodeCompanyAndId(
    idService: number,
    codeCompany: number,
  ): Promise<ServiceCompany | null> {
    const orm = await this.repository.findOne({
      where: { idServices: idService, codeCompany },
    });
    return orm ? ServiceCompanyMapper.toDomain(orm) : null;
  }

  async findPaginated(
    query: ServiceCompanyListQuery,
  ): Promise<ServiceCompanyPaginatedResult<ServiceCompany>> {
    const { page, pageSize, codeCompany, search } = query;
    const skip = (page - 1) * pageSize;

    const qb = this.repository
      .createQueryBuilder('sc')
      .select(['sc.idServices', 'sc.codeCompany', 'sc.name', 'sc.description'])
      .where('sc.codeCompany = :codeCompany', { codeCompany });

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      qb.andWhere('(sc.name LIKE :term OR sc.description LIKE :term)', {
        term,
      });
    }

    const [items, totalItems] = await qb
      .orderBy('sc.name', 'ASC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((orm) => ServiceCompanyMapper.toDomain(orm)),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
