import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TypeDocument } from '../../../../domain/entities/type-document.entity';
import {
  ITypeDocumentRepository,
  TypeDocumentListQuery,
  TypeDocumentPaginatedResult,
} from '../../../../domain/repositories/type-document.repository';
import { TypeDocument as TypeDocumentOrm } from '../entities/type_document/type_document';
import { Document } from '../entities/document/document';
import { TypeDocumentMapper } from '../mappers/type-document.mapper';

@Injectable()
export class TypeDocumentTypeOrmRepository implements ITypeDocumentRepository {
  private readonly repository: Repository<TypeDocumentOrm>;
  private readonly documentRepository: Repository<Document>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(TypeDocumentOrm);
    this.documentRepository = this.dataSource.getRepository(Document);
  }

  async save(entity: TypeDocument): Promise<TypeDocument> {
    const orm = TypeDocumentMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return TypeDocumentMapper.toDomain(saved);
  }

  async update(entity: TypeDocument): Promise<TypeDocument> {
    const orm = TypeDocumentMapper.toOrm(entity);
    const updated = await this.repository.save(orm);
    return TypeDocumentMapper.toDomain(updated);
  }

  async delete(idTypeDocument: number): Promise<void> {
    await this.repository.delete(idTypeDocument);
  }

  async findById(idTypeDocument: number): Promise<TypeDocument | null> {
    const orm = await this.repository.findOne({
      where: { idTypeDocument },
    });
    return orm ? TypeDocumentMapper.toDomain(orm) : null;
  }

  async findByName(nameTypeDocument: string): Promise<TypeDocument | null> {
    const orm = await this.repository.findOne({
      where: { nameTypeDocument },
    });
    return orm ? TypeDocumentMapper.toDomain(orm) : null;
  }

  async findPaginated(
    query: TypeDocumentListQuery,
  ): Promise<TypeDocumentPaginatedResult<TypeDocument>> {
    const { page, pageSize, search } = query;
    const skip = (page - 1) * pageSize;

    const qb = this.repository
      .createQueryBuilder('td')
      .select(['td.idTypeDocument', 'td.nameTypeDocument']);

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      qb.andWhere('td.nameTypeDocument LIKE :term', { term });
    }

    const [items, totalItems] = await qb
      .orderBy('td.nameTypeDocument', 'ASC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((orm) => TypeDocumentMapper.toDomain(orm)),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async countDocumentsByTypeDocumentId(
    idTypeDocument: number,
  ): Promise<number> {
    return this.documentRepository.count({
      where: { typeDocuments: { idTypeDocument } },
    });
  }
}
