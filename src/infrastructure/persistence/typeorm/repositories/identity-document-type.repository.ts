import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { IdentityDocumentType } from '../../../../domain/entities/identity-document-type.entity';
import { IIdentityDocumentTypeRepository, IdentityDocumentTypeListQuery, PaginatedResult } from '../../../../domain/repositories/identity-document-type.repository';
import { IdentityDocumentTypes } from '../entities/identity-document-types/identity-document-types';
import { IdentityDocumentTypeMapper } from '../mappers/identity-document-type.mapper';


@Injectable()
export class IdentityDocumentTypeTypeOrmRepository implements IIdentityDocumentTypeRepository {
  private readonly repository: Repository<IdentityDocumentTypes>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(IdentityDocumentTypes);
  }

  // Saves a new IdentityDocumentType entity.
  async save(entity: IdentityDocumentType): Promise<IdentityDocumentType> {
    const orm = IdentityDocumentTypeMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return IdentityDocumentTypeMapper.toDomain(saved);
  }

  // Updates an existing IdentityDocumentType entity.
  async update(entity: IdentityDocumentType): Promise<IdentityDocumentType> {
    const orm = IdentityDocumentTypeMapper.toOrm(entity);
    const updated = await this.repository.save(orm);
    return IdentityDocumentTypeMapper.toDomain(updated);
  }

  // Deletes IdentityDocumentType entity.
  async delete(idTypeIdentificationDocument: number): Promise<void> {
    await this.repository.delete(idTypeIdentificationDocument);
  }

  // Finds an IdentityDocumentType entity by its ID.
  async findById(idTypeIdentificationDocument: number): Promise<IdentityDocumentType | null> {
    const orm = await this.repository.findOne({
      where: { idTypeIdentificationDocument },
    });
    return orm ? IdentityDocumentTypeMapper.toDomain(orm) : null;
  }

  // Finds paginated IdentityDocumentType entities.
  async findPaginated(query: IdentityDocumentTypeListQuery): Promise<PaginatedResult<IdentityDocumentType>> {
    const { page, pageSize, search } = query;
    const skip = (page - 1) * pageSize;

    const qb = this.repository
      .createQueryBuilder('t')
      .select(['t.idTypeIdentificationDocument', 't.name', 't.abbreviation']);

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      qb.andWhere('(t.name LIKE :term OR t.abbreviation LIKE :term)', { term });
    }

    const [items, totalItems] = await qb
      .orderBy('t.name', 'ASC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((orm) => IdentityDocumentTypeMapper.toDomain(orm)),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
