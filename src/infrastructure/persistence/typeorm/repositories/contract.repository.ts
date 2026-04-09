import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { Contract } from '../../../../domain/entities/contract.entity';
import {
  ContractListQuery,
  ContractPaginatedResult,
  ContractWithRelations,
  IContractRepository,
} from '../../../../domain/repositories/contract.repository';
import { Contract as ContractOrm } from '../entities/contract/contract';
import { ContractMapper } from '../mappers/contract.mapper';

@Injectable()
export class ContractTypeOrmRepository implements IContractRepository {
  private readonly repository: Repository<ContractOrm>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(ContractOrm);
  }

  async save(entity: Contract): Promise<Contract> {
    const orm = ContractMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return ContractMapper.toDomain(saved);
  }

  async update(entity: Contract): Promise<void> {
    if (entity.idContract === undefined) {
      throw new Error('No se puede actualizar una entidad sin id');
    }
    await this.repository.update(
      { idContract: entity.idContract },
      {
        contractCode: entity.contractCode,
        idCase: entity.idCase,
        digitalSignature: entity.digitalSignature ?? '',
        createdAt: entity.createdAt,
      },
    );
  }

  async delete(idContract: number): Promise<void> {
    await this.repository.delete({ idContract });
  }

  async findById(idContract: number): Promise<Contract | null> {
    const orm = await this.repository.findOne({ where: { idContract } });
    return orm ? ContractMapper.toDomain(orm) : null;
  }

  async findByIdWithRelations(
    idContract: number,
  ): Promise<ContractWithRelations | null> {
    const orm = await this.repository.findOne({
      where: { idContract },
      relations: [
        'caseRecord',
        'caseRecord.stateCase',
        'caseRecord.company',
      ],
    });
    return orm ? this.mapToWithRelations(orm) : null;
  }

  async findByContractCode(
    contractCode: string,
  ): Promise<Contract | null> {
    const orm = await this.repository.findOne({
      where: { contractCode },
    });
    return orm ? ContractMapper.toDomain(orm) : null;
  }

  async findPaginated(
    query: ContractListQuery,
  ): Promise<ContractPaginatedResult<ContractWithRelations>> {
    const { page, pageSize, idCase } = query;
    const skip = (page - 1) * pageSize;

    const where: FindOptionsWhere<ContractOrm> = {};
    if (idCase !== undefined && idCase !== null) {
      where.idCase = idCase;
    }

    const [items, totalItems] = await this.repository.findAndCount({
      where,
      relations: [
        'caseRecord',
        'caseRecord.stateCase',
        'caseRecord.company',
      ],
      order: { idContract: 'DESC' },
      skip,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((row) => this.mapToWithRelations(row)),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  private mapToWithRelations(orm: ContractOrm): ContractWithRelations {
    return {
      idContract: orm.idContract,
      contractCode: orm.contractCode,
      idCase: orm.idCase,
      digitalSignature: orm.digitalSignature ?? null,
      createdAt: orm.createdAt,
      caseRecord: orm.caseRecord
        ? {
            idCase: orm.caseRecord.idCase,
            caseCode: orm.caseRecord.caseCode,
            holder: orm.caseRecord.holder,
            agent: orm.caseRecord.agent,
            codeCompany: orm.caseRecord.codeCompany,
            idStateCase: orm.caseRecord.idStateCase,
            createdAt: orm.caseRecord.createdAt,
            closingDate: orm.caseRecord.closingDate,
            stateCase: orm.caseRecord.stateCase
              ? {
                  idState: orm.caseRecord.stateCase.idState,
                  nameState: orm.caseRecord.stateCase.nameState,
                }
              : {
                  idState: orm.caseRecord.idStateCase,
                  nameState: '',
                },
            company: orm.caseRecord.company
              ? {
                  codeCompany: orm.caseRecord.company.codeCompany,
                  nameCompany: orm.caseRecord.company.nameCompany,
                  prefixCompany: orm.caseRecord.company.prefixCompany,
                }
              : {
                  codeCompany: orm.caseRecord.codeCompany,
                  nameCompany: '',
                  prefixCompany: '',
                },
          }
        : {
            idCase: 0,
            caseCode: '',
            holder: 0,
            agent: null,
            codeCompany: 0,
            idStateCase: 0,
            createdAt: new Date(),
            closingDate: null,
            stateCase: { idState: 0, nameState: '' },
            company: { codeCompany: 0, nameCompany: '', prefixCompany: '' },
          },
    };
  }
}
