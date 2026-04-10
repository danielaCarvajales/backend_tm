import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CaseRecord } from '../../../../domain/entities/case-record.entity';
import {
  CaseRecordListQuery,
  CaseRecordPaginatedResult,
  CaseRecordPersonItem,
  CaseRecordWithRelations,
  ICaseRecordRepository,
} from '../../../../domain/repositories/case-record.repository';
import { CaseRecord as CaseRecordOrm } from '../entities/case-record/case-record';
import { CaseRecordMapper } from '../mappers/case-record.mapper';
import { mapCaseRecordContracts } from '../mappers/contract-embed.mapper';

@Injectable()
export class CaseRecordTypeOrmRepository implements ICaseRecordRepository {
  private readonly repository: Repository<CaseRecordOrm>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(CaseRecordOrm);
  }

  async save(entity: CaseRecord): Promise<CaseRecord> {
    const orm = CaseRecordMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return CaseRecordMapper.toDomain(saved);
  }

  async update(entity: CaseRecord): Promise<CaseRecord> {
    if (entity.idCase === undefined) {
      throw new Error('No se puede actualizar una entidad sin id');
    }
    await this.repository.update(
      { idCase: entity.idCase },
      {
        agent: entity.agent,
        idStateCase: entity.idStateCase,
        closingDate: entity.closingDate,
        amount: entity.amount,
      },
    );
    const updated = await this.findById(entity.idCase);
    if (!updated) {
      throw new Error('CASE_RECORD_NOT_FOUND');
    }
    return updated;
  }

  async delete(idCase: number): Promise<void> {
    await this.repository.delete(idCase);
  }

  async findById(idCase: number): Promise<CaseRecord | null> {
    const orm = await this.repository.findOne({
      where: { idCase },
    });
    return orm ? CaseRecordMapper.toDomain(orm) : null;
  }

  async findByCaseCode(caseCode: string): Promise<CaseRecord | null> {
    const orm = await this.repository.findOne({
      where: { caseCode },
    });
    return orm ? CaseRecordMapper.toDomain(orm) : null;
  }

  async findByHolderAndCompany(
    holder: number,
    codeCompany: number,
  ): Promise<CaseRecordWithRelations | null> {
    const [orm] = await this.repository.find({
      where: { holder, codeCompany },
      relations: [
        'holderPerson',
        'holderPerson.typeDocument',
        'holderPerson.nationality',
        'agentPerson',
        'agentPerson.typeDocument',
        'agentPerson.nationality',
        'company',
        'stateCase',
        'serviceCases',
        'serviceCases.serviceCompany',
        'casePersons',
        'casePersons.person',
        'casePersons.person.typeDocument',
        'casePersons.person.nationality',
        'casePersons.familyRelationship',
        'contracts',
      ],
      order: { createdAt: 'DESC' },
      take: 1,
    });
    if (!orm) return null;
    return this.mapToWithRelations(orm);
  }

  async findByIdWithRelations(
    idCase: number,
  ): Promise<CaseRecordWithRelations | null> {
    const orm = await this.repository.findOne({
      where: { idCase },
      relations: [
        'holderPerson',
        'holderPerson.typeDocument',
        'holderPerson.nationality',
        'agentPerson',
        'agentPerson.typeDocument',
        'agentPerson.nationality',
        'company',
        'stateCase',
        'serviceCases',
        'serviceCases.serviceCompany',
        'casePersons',
        'casePersons.person',
        'casePersons.person.typeDocument',
        'casePersons.person.nationality',
        'casePersons.familyRelationship',
        'contracts',
      ],
    });
    if (!orm) return null;
    return this.mapToWithRelations(orm);
  }

  async findPaginated(
    query: CaseRecordListQuery,
  ): Promise<CaseRecordPaginatedResult<CaseRecordWithRelations>> {
    const { page, pageSize, holderFilter, codeCompanyFilter, search } = query;
    const skip = (page - 1) * pageSize;

    const qb = this.repository
      .createQueryBuilder('cr')
      .leftJoinAndSelect('cr.holderPerson', 'holder')
      .leftJoinAndSelect('holder.typeDocument', 'holderTypeDoc')
      .leftJoinAndSelect('holder.nationality', 'holderNationality')
      .leftJoinAndSelect('cr.agentPerson', 'agent')
      .leftJoinAndSelect('agent.typeDocument', 'agentTypeDoc')
      .leftJoinAndSelect('agent.nationality', 'agentNationality')
      .leftJoinAndSelect('cr.company', 'company')
      .leftJoinAndSelect('cr.stateCase', 'stateCase')
      .leftJoinAndSelect('cr.serviceCases', 'serviceCases')
      .leftJoinAndSelect('serviceCases.serviceCompany', 'serviceCompany')
      .leftJoinAndSelect('cr.casePersons', 'casePersons')
      .leftJoinAndSelect('casePersons.person', 'casePerson')
      .leftJoinAndSelect('casePerson.typeDocument', 'casePersonTypeDoc')
      .leftJoinAndSelect('casePerson.nationality', 'casePersonNationality')
      .leftJoinAndSelect('casePersons.familyRelationship', 'casePersonFr')
      .leftJoinAndSelect('cr.contracts', 'caseContracts')
      .select([
        'cr.idCase',
        'cr.caseCode',
        'cr.holder',
        'cr.agent',
        'cr.codeCompany',
        'cr.amount',
        'cr.idStateCase',
        'cr.createdAt',
        'cr.closingDate',
        'holder.idPerson',
        'holder.fullName',
        'holder.email',
        'holder.phone',
        'holder.documentNumber',
        'holder.idTypeDocument',
        'holder.idNationality',
        'holder.birthdate',
        'holderTypeDoc.idTypeIdentificationDocument',
        'holderTypeDoc.name',
        'holderNationality.idNacionality',
        'holderNationality.name',
        'agent.idPerson',
        'agent.fullName',
        'agent.email',
        'agent.phone',
        'agent.documentNumber',
        'agent.idTypeDocument',
        'agent.idNationality',
        'agent.birthdate',
        'agentTypeDoc.idTypeIdentificationDocument',
        'agentTypeDoc.name',
        'agentNationality.idNacionality',
        'agentNationality.name',
        'company.codeCompany',
        'company.nameCompany',
        'company.prefixCompany',
        'stateCase.idState',
        'stateCase.nameState',
        'serviceCases.idServiceCases',
        'serviceCases.idCase',
        'serviceCases.idServices',
        'serviceCases.observation',
        'serviceCases.createdAt',
        'serviceCompany.idServices',
        'serviceCompany.name',
        'serviceCompany.description',
        'casePersons.idCasePerson',
        'casePersons.idPerson',
        'casePersons.idFamilyRelationship',
        'casePersons.statePerson',
        'casePersons.createdAt',
        'casePersons.observation',
        'casePerson.idPerson',
        'casePerson.fullName',
        'casePerson.documentNumber',
        'casePerson.idTypeDocument',
        'casePerson.idNationality',
        'casePerson.birthdate',
        'casePersonTypeDoc.idTypeIdentificationDocument',
        'casePersonTypeDoc.name',
        'casePersonNationality.idNacionality',
        'casePersonNationality.name',
        'casePersonFr.idFamilyRelationship',
        'casePersonFr.nameFamilyRelationship',
        'caseContracts.idContract',
        'caseContracts.contractCode',
        'caseContracts.idCase',
        'caseContracts.digitalSignature',
        'caseContracts.createdAt',
      ]);

    if (holderFilter !== undefined) {
      qb.andWhere('cr.holder = :holderFilter', { holderFilter });
    }
    if (codeCompanyFilter !== undefined) {
      qb.andWhere('cr.codeCompany = :codeCompanyFilter', {
        codeCompanyFilter,
      });
    }
    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      qb.andWhere(
        '(cr.caseCode LIKE :term OR holder.fullName LIKE :term)',
        { term },
      );
    }

    const [items, totalItems] = await qb
      .orderBy('cr.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

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

  private mapToWithRelations(orm: CaseRecordOrm): CaseRecordWithRelations {
    return {
      idCase: orm.idCase,
      caseCode: orm.caseCode,
      holder: orm.holder,
      agent: orm.agent ?? null,
      codeCompany: orm.codeCompany,
      amount: String(orm.amount),
      idStateCase: orm.idStateCase,
      createdAt: orm.createdAt,
      closingDate: orm.closingDate ?? null,
      holderPerson: orm.holderPerson
        ? {
            idPerson: orm.holderPerson.idPerson,
            fullName: orm.holderPerson.fullName,
            email: orm.holderPerson.email,
            phone: orm.holderPerson.phone,
            documentNumber: orm.holderPerson.documentNumber,
            birthdate: orm.holderPerson.birthdate,
            typeDocument: orm.holderPerson.typeDocument
              ? {
                  idTypeDocument: orm.holderPerson.typeDocument.idTypeIdentificationDocument,
                  nameTypeDocument: orm.holderPerson.typeDocument.name,
                }
              : {
                  idTypeDocument: orm.holderPerson.idTypeDocument,
                  nameTypeDocument: '',
                },
            nationality: orm.holderPerson.nationality
              ? {
                  idNationality: orm.holderPerson.nationality.idNacionality,
                  nameNationality: orm.holderPerson.nationality.name,
                }
              : {
                  idNationality: orm.holderPerson.idNationality,
                  nameNationality: '',
                },
          }
        : {
            idPerson: 0,
            fullName: '',
            email: '',
            phone: '',
            documentNumber: '',
            birthdate: new Date(),
            typeDocument: { idTypeDocument: 0, nameTypeDocument: '' },
            nationality: { idNationality: 0, nameNationality: '' },
          },
      agentPerson: orm.agentPerson
        ? {
            idPerson: orm.agentPerson.idPerson,
            fullName: orm.agentPerson.fullName,
            email: orm.agentPerson.email,
            phone: orm.agentPerson.phone,
            documentNumber: orm.agentPerson.documentNumber,
            birthdate: orm.agentPerson.birthdate,
            typeDocument: orm.agentPerson.typeDocument
              ? {
                  idTypeDocument: orm.agentPerson.typeDocument.idTypeIdentificationDocument,
                  nameTypeDocument: orm.agentPerson.typeDocument.name,
                }
              : {
                  idTypeDocument: orm.agentPerson.idTypeDocument,
                  nameTypeDocument: '',
                },
            nationality: orm.agentPerson.nationality
              ? {
                  idNationality: orm.agentPerson.nationality.idNacionality,
                  nameNationality: orm.agentPerson.nationality.name,
                }
              : {
                  idNationality: orm.agentPerson.idNationality,
                  nameNationality: '',
                },
          }
        : null,
      company: orm.company
        ? {
            codeCompany: orm.company.codeCompany,
            nameCompany: orm.company.nameCompany,
            prefixCompany: orm.company.prefixCompany,
          }
        : {
            codeCompany: 0,
            nameCompany: '',
            prefixCompany: '',
          },
      stateCase: orm.stateCase
        ? {
            idState: orm.stateCase.idState,
            nameState: orm.stateCase.nameState,
          }
        : {
            idState: 0,
            nameState: '',
          },
      services: (orm.serviceCases ?? []).map((sc) => ({
        idServiceCases: sc.idServiceCases,
        idService: sc.idServices,
        observations: sc.observation ?? null,
        createdAt: sc.createdAt,
        serviceName: sc.serviceCompany?.name ?? '',
        serviceDescription: sc.serviceCompany?.description ?? '',
      })),
      persons: (orm.casePersons ?? []).map((cp): CaseRecordPersonItem => ({
        idCasePerson: cp.idCasePerson,
        idPerson: cp.idPerson,
        idFamilyRelationship: cp.idFamilyRelationship,
        statePerson: cp.statePerson,
        createdAt: cp.createdAt,
        observation: cp.observation ?? null,
        personFullName: cp.person?.fullName ?? '',
        personDocumentNumber: cp.person?.documentNumber ?? '',
        personIdTypeDocument: cp.person?.idTypeDocument ?? 0,
        personBirthdate: cp.person?.birthdate ?? null,
        personTypeDocument: cp.person?.typeDocument
          ? {
              idTypeDocument: cp.person.typeDocument.idTypeIdentificationDocument,
              nameTypeDocument: cp.person.typeDocument.name,
            }
          : null,
        personNationality: cp.person?.nationality
          ? {
              idNationality: cp.person.nationality.idNacionality,
              nameNationality: cp.person.nationality.name,
            }
          : null,
        familyRelationshipName:
          cp.familyRelationship?.nameFamilyRelationship ?? '',
      })),
      contracts: mapCaseRecordContracts(orm.contracts),
    };
  }
}
