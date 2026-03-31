import { CaseDocuments } from '../../../../domain/entities/case-documents.entity';
import { CaseDocument as CaseDocumentOrm } from '../entities/case-document/case-document';

export class CaseDocumentsMapper {
  static toDomain(orm: CaseDocumentOrm): CaseDocuments {
    return new CaseDocuments(
      orm.idCaseDocuments,
      orm.idCase,
      orm.idDocument,
    );
  }

  static toOrm(domain: CaseDocuments): CaseDocumentOrm {
    return new CaseDocumentOrm(
      domain.idCaseDocuments ?? 0,
      domain.idCase,
      domain.idDocument,
    );
  }
}
