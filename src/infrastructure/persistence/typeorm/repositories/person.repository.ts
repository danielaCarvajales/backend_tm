import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Person } from '../../../../domain/entities/person.entity';
import {
  IPersonRepository,
  PersonListQuery,
  PersonPaginatedResult,
  PersonWithRelations,
} from '../../../../domain/repositories/person.repository';
import { Person as PersonOrm } from '../entities/person/person';
import { PersonMapper } from '../mappers/person.mapper';

@Injectable()
export class PersonTypeOrmRepository implements IPersonRepository {
  private readonly repository: Repository<PersonOrm>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(PersonOrm);
  }

  // Saves a new Person entity.
  async save(entity: Person): Promise<Person> {
    const orm = PersonMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return PersonMapper.toDomain(saved);
  }

  // Updates an existing Person entity.
  async update(entity: Person): Promise<Person> {
    const orm = PersonMapper.toOrm(entity);
    const updated = await this.repository.save(orm);
    return PersonMapper.toDomain(updated);
  }

  // Deletes Person entity.
  async delete(idPerson: number): Promise<void> {
    await this.repository.delete(idPerson);
  }

  // Finds a Person entity by its ID.
  async findById(idPerson: number): Promise<Person | null> {
    const orm = await this.repository.findOne({
      where: { idPerson },
    });
    return orm ? PersonMapper.toDomain(orm) : null;
  }

  // Finds a Person entity by its ID with full relations (typeDocument, nationality).
  async findByIdWithRelations(
    idPerson: number,
  ): Promise<PersonWithRelations | null> {
    const orm = await this.repository.findOne({
      where: { idPerson },
      relations: ['typeDocument', 'nationality'],
    });
    if (!orm) return null;
    const base = PersonMapper.toDomain(orm);
    return {
      ...base,
      typeDocument: orm.typeDocument
        ? {
            idTypeDocument: orm.typeDocument.idTypeIdentificationDocument,
            nameTypeDocument: orm.typeDocument.name,
          }
        : {
            idTypeDocument: orm.idTypeDocument,
            nameTypeDocument: '',
          },
      nationality: orm.nationality
        ? {
            idNationality: orm.nationality.idNacionality,
            nameNationality: orm.nationality.name,
          }
        : {
            idNationality: orm.idNationality,
            nameNationality: '',
          },
    };
  }

  // Finds a Person entity by personCode (for uniqueness validation).
  async findByPersonCode(personCode: string): Promise<Person | null> {
    const orm = await this.repository.findOne({
      where: { personCode },
    });
    return orm ? PersonMapper.toDomain(orm) : null;
  }

  // Finds paginated Person entities with full relations.
  async findPaginated(
    query: PersonListQuery,
  ): Promise<PersonPaginatedResult<PersonWithRelations>> {
    const { page, pageSize, search } = query;
    const skip = (page - 1) * pageSize;

    const qb = this.repository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.typeDocument', 'typeDoc')
      .leftJoinAndSelect('p.nationality', 'nationality')
      .select([
        'p.idPerson',
        'p.personCode',
        'p.fullName',
        'p.idTypeDocument',
        'p.documentNumber',
        'p.birthdate',
        'p.idNationality',
        'p.phone',
        'p.email',
        'typeDoc.idTypeIdentificationDocument',
        'typeDoc.name',
        'nationality.idNacionality',
        'nationality.name',
      ]);

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      qb.andWhere(
        '(p.fullName LIKE :term OR p.documentNumber LIKE :term OR p.email LIKE :term OR p.personCode LIKE :term)',
        { term },
      );
    }

    const [items, totalItems] = await qb
      .orderBy('p.fullName', 'ASC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((orm): PersonWithRelations => {
        const base = PersonMapper.toDomain(orm);
        return {
          ...base,
          typeDocument: orm.typeDocument
            ? {
                idTypeDocument: orm.typeDocument.idTypeIdentificationDocument,
                nameTypeDocument: orm.typeDocument.name,
              }
            : {
                idTypeDocument: orm.idTypeDocument,
                nameTypeDocument: '',
              },
          nationality: orm.nationality
            ? {
                idNationality: orm.nationality.idNacionality,
                nameNationality: orm.nationality.name,
              }
            : {
                idNationality: orm.idNationality,
                nameNationality: '',
              },
        };
      }),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
