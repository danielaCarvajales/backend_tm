import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ServiceCases } from '../../../../domain/entities/service-cases.entity';
import {
  IServiceCasesRepository,
  ServiceCasesListQuery,
  ServiceCasesPaginatedResult,
  ServiceCasesWithRelations,
} from '../../../../domain/repositories/service-cases.repository';
import { ServiceCases as ServiceCasesOrm } from '../entities/service-cases/service-cases';
import { ServiceCasesMapper } from '../mappers/service-cases.mapper';
import { mapCaseRecordContracts } from '../mappers/contract-embed.mapper';

@Injectable()
export class ServiceCasesTypeOrmRepository implements IServiceCasesRepository {
  private readonly repository: Repository<ServiceCasesOrm>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(ServiceCasesOrm);
  }

  async save(entity: ServiceCases): Promise<ServiceCases> {
    const orm = ServiceCasesMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return ServiceCasesMapper.toDomain(saved);
  }

  async update(entity: ServiceCases): Promise<ServiceCases> {
    if (entity.idServiceCases === undefined) {
      throw new Error('Cannot update entity without id');
    }
    await this.repository.update(
      { idServiceCases: entity.idServiceCases },
      {
        observation: entity.observation ?? '',
      },
    );
    const updated = await this.findByCaseAndId(
      entity.idCase,
      entity.idServiceCases,
    );
    if (!updated) {
      throw new Error('SERVICE_CASES_NOT_FOUND');
    }
    return updated;
  }

  async delete(idServiceCases: number): Promise<void> {
    await this.repository.delete({ idServiceCases });
  }

  async findById(idServiceCases: number): Promise<ServiceCases | null> {
    const orm = await this.repository.findOne({
      where: { idServiceCases },
    });
    return orm ? ServiceCasesMapper.toDomain(orm) : null;
  }

  async findByCaseAndId(
    idCase: number,
    idServiceCases: number,
  ): Promise<ServiceCases | null> {
    const orm = await this.repository.findOne({
      where: { idCase, idServiceCases },
    });
    return orm ? ServiceCasesMapper.toDomain(orm) : null;
  }

  async findByCaseAndIdWithRelations(
    idCase: number,
    idServiceCases: number,
  ): Promise<ServiceCasesWithRelations | null> {
    const orm = await this.repository.findOne({
      where: { idCase, idServiceCases },
      relations: ['serviceCompany', 'caseRecord', 'caseRecord.contracts'],
    });
    return orm ? this.mapToWithRelations(orm) : null;
  }

  async findByCaseAndService(
    idCase: number,
    idService: number,
  ): Promise<ServiceCases | null> {
    const orm = await this.repository.findOne({
      where: { idCase, idServices: idService },
    });
    return orm ? ServiceCasesMapper.toDomain(orm) : null;
  }

  async findPaginated(
    query: ServiceCasesListQuery,
  ): Promise<ServiceCasesPaginatedResult<ServiceCases>> {
    const { page, pageSize, idCase } = query;
    const skip = (page - 1) * pageSize;

    const [items, totalItems] = await this.repository.findAndCount({
      where: { idCase },
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((orm) => ServiceCasesMapper.toDomain(orm)),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async findPaginatedWithRelations(
    query: ServiceCasesListQuery,
  ): Promise<ServiceCasesPaginatedResult<ServiceCasesWithRelations>> {
    const { page, pageSize, idCase } = query;
    const skip = (page - 1) * pageSize;

    const [items, totalItems] = await this.repository.findAndCount({
      where: { idCase },
      relations: ['serviceCompany', 'caseRecord', 'caseRecord.contracts'],
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((orm) => this.mapToWithRelations(orm)),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  private mapToWithRelations(orm: ServiceCasesOrm): ServiceCasesWithRelations {
    return {
      idServiceCases: orm.idServiceCases,
      idCase: orm.idCase,
      idServices: orm.idServices,
      observation: orm.observation ?? null,
      createdAt: orm.createdAt,
      serviceCompany: orm.serviceCompany
        ? {
            idService: orm.serviceCompany.idServices,
            name: orm.serviceCompany.name,
            description: orm.serviceCompany.description,
          }
        : {
            idService: orm.idServices,
            name: '',
            description: '',
          },
      caseRecord: orm.caseRecord
        ? {
            idCase: orm.caseRecord.idCase,
            caseCode: orm.caseRecord.caseCode,
          }
        : {
            idCase: orm.idCase,
            caseCode: '',
          },
      contracts: mapCaseRecordContracts(orm.caseRecord?.contracts),
    };
  }
}
