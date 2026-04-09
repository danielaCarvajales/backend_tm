import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CaseDocuments } from '../../../../domain/entities/case-documents.entity';
import {
  CaseDocumentsListQuery,
  CaseDocumentsPaginatedResult,
  CaseDocumentsWithRelations,
  ICaseDocumentsRepository,
} from '../../../../domain/repositories/case-documents.repository';
import { CaseDocument as CaseDocumentOrm } from '../entities/case-document/case-document';
import { CaseDocumentsMapper } from '../mappers/case-documents.mapper';
import { DocumentMapper } from '../mappers/document.mapper';

@Injectable()
export class CaseDocumentsTypeOrmRepository implements ICaseDocumentsRepository {
  private readonly repository: Repository<CaseDocumentOrm>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(CaseDocumentOrm);
  }

  async save(entity: CaseDocuments): Promise<CaseDocuments> {
    const orm = CaseDocumentsMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return CaseDocumentsMapper.toDomain(saved);
  }

  async update(entity: CaseDocuments): Promise<CaseDocuments> {
    if (entity.idCaseDocuments === undefined) {
      throw new Error('No se puede actualizar una entidad sin id');
    }
    await this.repository.update(
      { idCaseDocuments: entity.idCaseDocuments },
      {
        idCase: entity.idCase,
        idDocument: entity.idDocument,
      },
    );
    const updated = await this.findByIdWithRelations(entity.idCaseDocuments);
    if (!updated) {
      throw new Error('CASE_DOCUMENTS_NOT_FOUND');
    }
    return new CaseDocuments(
      updated.idCaseDocuments,
      updated.idCase,
      updated.idDocument,
    );
  }

  async delete(idCaseDocuments: number): Promise<void> {
    await this.repository.delete({ idCaseDocuments });
  }

  async findByIdWithRelations(
    idCaseDocuments: number,
  ): Promise<CaseDocumentsWithRelations | null> {
    const orm = await this.repository.findOne({
      where: { idCaseDocuments },
      relations: [
        'caseRecord',
        'caseRecord.stateCase',
        'caseRecord.company',
        'document',
        'document.documentType',
      ],
    });
    return orm ? this.mapToWithRelations(orm) : null;
  }

  async findByCaseAndDocument(
    idCase: number,
    idDocument: number,
  ): Promise<CaseDocuments | null> {
    const orm = await this.repository.findOne({
      where: { idCase, idDocument },
    });
    return orm ? CaseDocumentsMapper.toDomain(orm) : null;
  }

  async findPaginated(
    query: CaseDocumentsListQuery,
  ): Promise<CaseDocumentsPaginatedResult<CaseDocumentsWithRelations>> {
    const { page, pageSize, idCase } = query;
    const skip = (page - 1) * pageSize;

    const where =
      idCase !== undefined && idCase !== null ? { idCase } : {};

    const [items, totalItems] = await this.repository.findAndCount({
      where,
      relations: [
        'caseRecord',
        'caseRecord.stateCase',
        'caseRecord.company',
        'document',
        'document.documentType',
      ],
      order: { idCaseDocuments: 'DESC' },
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

  private mapToWithRelations(orm: CaseDocumentOrm): CaseDocumentsWithRelations {
    return {
      idCaseDocuments: orm.idCaseDocuments,
      idCase: orm.idCase,
      idDocument: orm.idDocument,
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
      document: this.mapDocumentView(orm),
    };
  }

  private mapDocumentView(
    orm: CaseDocumentOrm,
  ): CaseDocumentsWithRelations['document'] {
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
