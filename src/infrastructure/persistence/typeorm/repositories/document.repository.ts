import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Document } from '../../../../domain/entities/document.entity';
import {
  DocumentListQuery,
  IDocumentRepository,
  PaginatedResult,
} from '../../../../domain/repositories/document.repository';
import { Document as DocumentOrm } from '../entities/document/document';
import { DocumentMapper } from '../mappers/document.mapper';

@Injectable()
export class DocumentTypeOrmRepository implements IDocumentRepository {
  private readonly repository: Repository<DocumentOrm>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(DocumentOrm);
  }

  // Saves a new Document entity.
  async save(entity: Document): Promise<Document> {
    const orm = DocumentMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    const reloaded = await this.repository.findOne({
      where: { idDocument: saved.idDocument },
      relations: ['documentType'],
    });
    return DocumentMapper.toDomain(reloaded ?? saved);
  }

  // Updates an existing Document entity.
  async update(entity: Document): Promise<Document> {
    const orm = DocumentMapper.toOrm(entity);
    const updated = await this.repository.save(orm);
    const reloaded = await this.repository.findOne({
      where: { idDocument: updated.idDocument },
      relations: ['documentType'],
    });
    return DocumentMapper.toDomain(reloaded ?? updated);
  }

  // Deletes Document entity.
  async delete(idDocument: number): Promise<void> {
    await this.repository.delete(idDocument);
  }

  // Finds a Document entity by its ID.
  async findById(idDocument: number): Promise<Document | null> {
    const orm = await this.repository.findOne({
      where: { idDocument },
      relations: ['documentType'],
    });
    return orm ? DocumentMapper.toDomain(orm) : null;
  }

  // Finds paginated Document entities.
  async findPaginated(
    query: DocumentListQuery,
  ): Promise<PaginatedResult<Document>> {
    const { page, pageSize, search } = query;
    const skip = (page - 1) * pageSize;

    const qb = this.repository
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.documentType', 'td');

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      qb.andWhere(
        '(d.nameFileDocument LIKE :term OR d.descriptionDocument LIKE :term OR td.nameTypeDocument LIKE :term)',
        { term },
      );
    }

    const [items, totalItems] = await qb
      .orderBy('d.createdAtDocument', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((orm) => DocumentMapper.toDomain(orm)),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
