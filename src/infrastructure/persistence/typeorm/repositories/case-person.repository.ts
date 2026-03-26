import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CasePerson } from '../../../../domain/entities/case-person.entity';
import {
  CasePersonListQuery,
  CasePersonPaginatedResult,
  CasePersonWithRelations,
  ExistingPersonInCase,
  ICasePersonRepository,
} from '../../../../domain/repositories/case-person.repository';
import { CasePerson as CasePersonOrm } from '../entities/case-person/case-person';
import { CasePersonMapper } from '../mappers/case-person.mapper';

@Injectable()
export class CasePersonTypeOrmRepository implements ICasePersonRepository {
  private readonly repository: Repository<CasePersonOrm>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(CasePersonOrm);
  }

  //agregar una persona en un caso
  async save(entity: CasePerson): Promise<CasePerson> {
    const orm = CasePersonMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return CasePersonMapper.toDomain(saved);
  }

  //actualizar una persona en un caso
  async update(entity: CasePerson): Promise<CasePerson> {
    if (entity.idCasePerson === undefined) {
      throw new Error('Cannot update entity without id');
    }
    await this.repository.update(
      { idCasePerson: entity.idCasePerson },
      {
        idFamilyRelationship: entity.idFamilyRelationship,
        statePerson: entity.statePerson,
        observation: entity.observation ?? '',
      },
    );
    const updated = await this.findById(entity.idCasePerson);
    if (!updated) {
      throw new Error('CASE_PERSON_NOT_FOUND');
    }
    return updated;
  }

  //eliminar una persona en un caso
  async delete(idCasePerson: number): Promise<void> {
    await this.repository.delete({ idCasePerson });
  }

  //obtener una persona en un caso
  async findById(idCasePerson: number): Promise<CasePerson | null> {
    const orm = await this.repository.findOne({
      where: { idCasePerson },
    });
    return orm ? CasePersonMapper.toDomain(orm) : null;
  }

  //obtener una persona en un caso con sus relaciones
  async findByIdWithRelations(
    idCasePerson: number,
  ): Promise<CasePersonWithRelations | null> {
    const orm = await this.repository.findOne({
      where: { idCasePerson },
      relations: [
        'person',
        'person.typeDocument',
        'person.nationality',
        'familyRelationship',
      ],
    });
    return orm ? this.mapToWithRelations(orm) : null;
  }

  //obtener una persona en un caso con sus relaciones por id de caso y id de persona
  async findByCaseAndId(
    idCase: number,
    idCasePerson: number,
  ): Promise<CasePersonWithRelations | null> {
    const orm = await this.repository.findOne({
      where: { idCase, idCasePerson },
      relations: [
        'person',
        'person.typeDocument',
        'person.nationality',
        'familyRelationship',
      ],
    });
    return orm ? this.mapToWithRelations(orm) : null;
  }

  //Obtener persona por su información de nombre, número de documento y tipo de documento
  async findByCaseAndPersonIdentifiers(
    idCase: number,
    fullName: string,
    documentNumber: string,
    idTypeDocument: number,
  ): Promise<ExistingPersonInCase | null> {
    const orm = await this.repository
      .createQueryBuilder('cp')
      .innerJoinAndSelect('cp.person', 'p')
      .innerJoinAndSelect('cp.familyRelationship', 'fr')
      .where('cp.idCase = :idCase', { idCase })
      .andWhere('p.fullName = :fullName', { fullName })
      .andWhere('p.documentNumber = :documentNumber', { documentNumber })
      .andWhere('p.idTypeDocument = :idTypeDocument', { idTypeDocument })
      .getOne();

    if (!orm) return null;

    return {
      idCasePerson: orm.idCasePerson,
      idPerson: orm.person!.idPerson,
      fullName: orm.person!.fullName,
      documentNumber: orm.person!.documentNumber,
      idTypeDocument: orm.person!.idTypeDocument,
      familyRelationship: orm.familyRelationship?.nameFamilyRelationship ?? '',
    };
  }

  async findPaginated(
    query: CasePersonListQuery,
  ): Promise<CasePersonPaginatedResult<CasePersonWithRelations>> {
    const { page, pageSize, idCase } = query;
    const skip = (page - 1) * pageSize;

    const [items, totalItems] = await this.repository.findAndCount({
      where: { idCase },
      relations: [
        'person',
        'person.typeDocument',
        'person.nationality',
        'familyRelationship',
      ],
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

  //mapear una persona en un caso con sus relaciones
  private mapToWithRelations(orm: CasePersonOrm): CasePersonWithRelations {
    return {
      idCasePerson: orm.idCasePerson,
      idCase: orm.idCase,
      idPerson: orm.idPerson,
      idFamilyRelationship: orm.idFamilyRelationship,
      statePerson: orm.statePerson,
      createdAt: orm.createdAt,
      observation: orm.observation ?? null,
      person: orm.person
        ? {
            idPerson: orm.person.idPerson,
            fullName: orm.person.fullName,
            documentNumber: orm.person.documentNumber,
            idTypeDocument: orm.person.idTypeDocument,
            email: orm.person.email,
            phone: orm.person.phone,
            birthdate: orm.person.birthdate,
            typeDocument: orm.person.typeDocument
              ? {
                  idTypeDocument: orm.person.typeDocument.idTypeIdentificationDocument,
                  nameTypeDocument: orm.person.typeDocument.name,
                }
              : {
                  idTypeDocument: orm.person.idTypeDocument,
                  nameTypeDocument: '',
                },
            nationality: orm.person.nationality
              ? {
                  idNationality: orm.person.nationality.idNacionality,
                  nameNationality: orm.person.nationality.name,
                }
              : {
                  idNationality: orm.person.idNationality,
                  nameNationality: '',
                },
          }
        : {
            idPerson: 0,
            fullName: '',
            documentNumber: '',
            idTypeDocument: 0,
            email: '',
            phone: '',
            birthdate: new Date(),
            typeDocument: { idTypeDocument: 0, nameTypeDocument: '' },
            nationality: { idNationality: 0, nameNationality: '' },
          },
      familyRelationship: orm.familyRelationship
        ? {
            idFamilyRelationship: orm.familyRelationship.idFamilyRelationship,
            nameFamilyRelationship: orm.familyRelationship.nameFamilyRelationship,
          }
        : {
            idFamilyRelationship: 0,
            nameFamilyRelationship: '',
          },
    };
  }
}
