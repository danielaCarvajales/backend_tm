import { Document } from '../../../../domain/entities/document.entity';
import { TypeDocument } from '../../../../domain/entities/type-document.entity';
import { Document as DocumentOrm } from '../entities/document/document';

export class DocumentMapper {
  // Maps ORM entity to domain entity.
  static toDomain(orm: DocumentOrm): Document {
    const typeDoc =
      orm.documentType != null
        ? new TypeDocument(
            orm.documentType.idTypeDocument,
            orm.documentType.nameTypeDocument,
          )
        : null;
    return new Document(
      orm.idDocument,
      orm.nameFileDocument,
      orm.descriptionDocument,
      orm.urlDocument,
      orm.mimeType,
      orm.idTypeDocument,
      orm.createdAtDocument,
      typeDoc,
    );
  }

  // Maps domain entity to ORM entity (for save/update).
  static toOrm(domain: Document): DocumentOrm {
    const orm = new DocumentOrm();
    orm.nameFileDocument = domain.nameFileDocument;
    orm.descriptionDocument = domain.descriptionDocument;
    orm.urlDocument = domain.urlDocument;
    orm.mimeType = domain.mimeType;
    orm.idTypeDocument = domain.idTypeDocument;
    orm.createdAtDocument = domain.createdAtDocument;
    if (domain.idDocument !== undefined) {
      orm.idDocument = domain.idDocument;
    }
    return orm;
  }
}
