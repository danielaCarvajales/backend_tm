import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FamilyRelationship } from '../../../../domain/entities/family-relationship.entity';
import {
  FamilyRelationshipListQuery,
  FamilyRelationshipPaginatedResult,
  IFamilyRelationshipRepository,
} from '../../../../domain/repositories/family-relationship.repository';
import { FamilyRelationship as FamilyRelationshipOrm } from '../entities/family-relationship/family-relationship';
import { CasePerson } from '../entities/case-person/case-person';
import { FamilyRelationshipMapper } from '../mappers/family-relationship.mapper';

@Injectable()
export class FamilyRelationshipTypeOrmRepository
  implements IFamilyRelationshipRepository
{
  private readonly repository: Repository<FamilyRelationshipOrm>;
  private readonly casePersonRepository: Repository<CasePerson>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(FamilyRelationshipOrm);
    this.casePersonRepository = this.dataSource.getRepository(CasePerson);
  }

  async save(entity: FamilyRelationship): Promise<FamilyRelationship> {
    const orm = FamilyRelationshipMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return FamilyRelationshipMapper.toDomain(saved);
  }

  async update(entity: FamilyRelationship): Promise<FamilyRelationship> {
    const orm = FamilyRelationshipMapper.toOrm(entity);
    const updated = await this.repository.save(orm);
    return FamilyRelationshipMapper.toDomain(updated);
  }

  async delete(idFamilyRelationship: number): Promise<void> {
    await this.repository.delete(idFamilyRelationship);
  }

  async findById(
    idFamilyRelationship: number,
  ): Promise<FamilyRelationship | null> {
    const orm = await this.repository.findOne({
      where: { idFamilyRelationship },
    });
    return orm ? FamilyRelationshipMapper.toDomain(orm) : null;
  }

  async findByName(
    nameFamilyRelationship: string,
  ): Promise<FamilyRelationship | null> {
    const orm = await this.repository.findOne({
      where: { nameFamilyRelationship },
    });
    return orm ? FamilyRelationshipMapper.toDomain(orm) : null;
  }

  async findPaginated(
    query: FamilyRelationshipListQuery,
  ): Promise<FamilyRelationshipPaginatedResult<FamilyRelationship>> {
    const { page, pageSize, search } = query;
    const skip = (page - 1) * pageSize;

    const qb = this.repository
      .createQueryBuilder('fr')
      .select(['fr.idFamilyRelationship', 'fr.nameFamilyRelationship']);

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      qb.andWhere('fr.nameFamilyRelationship LIKE :term', { term });
    }

    const [items, totalItems] = await qb
      .orderBy('fr.nameFamilyRelationship', 'ASC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((orm) => FamilyRelationshipMapper.toDomain(orm)),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async countCasePersonsByFamilyRelationshipId(
    idFamilyRelationship: number,
  ): Promise<number> {
    return this.casePersonRepository.count({
      where: { idFamilyRelationship },
    });
  }
}
