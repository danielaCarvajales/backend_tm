import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PersonDocuments } from '../../../../domain/entities/person-documents.entity';
import {
  IPersonDocumentsRepository,
  PersonDocumentsListQuery,
  PersonDocumentsPaginatedResult,
  PersonDocumentsWithRelations,
} from '../../../../domain/repositories/person-documents.repository';
import { DocumentMapper } from '../mappers/document.mapper';
import { PersonDocumentsMapper } from '../mappers/person-documents.mapper';
import { PersonDocuments as PersonDocumentsOrm } from '../entities/person-documents/person-documents';

@Injectable()
export class PersonDocumentsTypeOrmRepository implements IPersonDocumentsRepository {
  private readonly repository: Repository<PersonDocumentsOrm>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(PersonDocumentsOrm);
  }

  async save(entity: PersonDocuments): Promise<PersonDocuments> {
    const orm = PersonDocumentsMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return PersonDocumentsMapper.toDomain(saved);
  }

  async update(entity: PersonDocuments): Promise<PersonDocuments> {
    if (entity.idPersonDocuments === undefined) {
      throw new Error('Cannot update entity without id');
    }
    await this.repository.update(
      { idPersonDocuments: entity.idPersonDocuments },
      {
        idPerson: entity.idPerson,
        idDocument: entity.idDocument,
      },
    );
    const updated = await this.findByIdWithRelations(entity.idPersonDocuments);
    if (!updated) {
      throw new Error('PERSON_DOCUMENTS_NOT_FOUND');
    }
    return new PersonDocuments(
      updated.idPersonDocuments,
      updated.idPerson,
      updated.idDocument,
    );
  }

  async delete(idPersonDocuments: number): Promise<void> {
    await this.repository.delete({ idPersonDocuments });
  }

  async findByIdWithRelations(
    idPersonDocuments: number,
  ): Promise<PersonDocumentsWithRelations | null> {
    const orm = await this.repository.findOne({
      where: { idPersonDocuments },
      relations: [
        'person',
        'person.typeDocument',
        'person.nationality',
        'document',
        'document.documentType',
      ],
    });
    return orm ? this.mapToWithRelations(orm) : null;
  }

  async findByPersonAndDocument(
    idPerson: number,
    idDocument: number,
  ): Promise<PersonDocuments | null> {
    const orm = await this.repository.findOne({
      where: { idPerson, idDocument },
    });
    return orm ? PersonDocumentsMapper.toDomain(orm) : null;
  }

  async findPaginated(
    query: PersonDocumentsListQuery,
  ): Promise<
    PersonDocumentsPaginatedResult<PersonDocumentsWithRelations>
  > {
    const { page, pageSize, idPerson } = query;
    const skip = (page - 1) * pageSize;

    const where =
      idPerson !== undefined && idPerson !== null
        ? { idPerson }
        : {};

    const [items, totalItems] = await this.repository.findAndCount({
      where,
      relations: [
        'person',
        'person.typeDocument',
        'person.nationality',
        'document',
        'document.documentType',
      ],
      order: { idPersonDocuments: 'DESC' },
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

  private mapToWithRelations(orm: PersonDocumentsOrm): PersonDocumentsWithRelations {
    const docView = this.mapDocumentView(orm);
    return {
      idPersonDocuments: orm.idPersonDocuments,
      idPerson: orm.idPerson,
      idDocument: orm.idDocument,
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
                  idTypeDocument:
                    orm.person.typeDocument.idTypeIdentificationDocument,
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
      document: docView,
    };
  }

  private mapDocumentView(
    orm: PersonDocumentsOrm,
  ): PersonDocumentsWithRelations['document'] {
    if (!orm.document) {
      return {
        idDocument: 0,
        nameFileDocument: '',
        descriptionDocument: null,
        urlDocument: '',
        mimeType: '',
        idTypeDocument: null,
        createdAtDocument: new Date(),
        typeDocument: null,
      };
    }
    const d = DocumentMapper.toDomain(orm.document);
    return {
      idDocument: d.idDocument ?? 0,
      nameFileDocument: d.nameFileDocument,
      descriptionDocument: d.descriptionDocument,
      urlDocument: d.urlDocument,
      mimeType: d.mimeType,
      idTypeDocument: d.idTypeDocument,
      createdAtDocument: d.createdAtDocument,
      typeDocument: d.typeDocument
        ? {
            idTypeDocument: d.typeDocument.idTypeDocument ?? 0,
            nameTypeDocument: d.typeDocument.nameTypeDocument,
          }
        : null,
    };
  }
}
