import { TypeDocument } from '../../../../domain/entities/type-document.entity';
import { TypeDocument as TypeDocumentOrm } from '../entities/type_document/type_document';

export class TypeDocumentMapper {
  static toDomain(orm: TypeDocumentOrm): TypeDocument {
    return new TypeDocument(orm.idTypeDocument, orm.nameTypeDocument);
  }

  static toOrm(domain: TypeDocument): TypeDocumentOrm {
    return new TypeDocumentOrm(
      domain.idTypeDocument ?? 0,
      domain.nameTypeDocument,
    );
  }
}
