import { IdentityDocumentType } from '../../../../domain/entities/identity-document-type.entity';
import { IdentityDocumentTypes } from '../entities/identity-document-types/identity-document-types';

export class IdentityDocumentTypeMapper {
  // Maps ORM entity to domain entity.
  static toDomain(orm: IdentityDocumentTypes): IdentityDocumentType {
    return new IdentityDocumentType(
      orm.idTypeIdentificationDocument,
      orm.name,
      orm.abbreviation,
    );
  }

  // Maps domain entity to ORM entity (for save/update).
  static toOrm(domain: IdentityDocumentType): IdentityDocumentTypes {
    const orm = new IdentityDocumentTypes(domain.name, domain.abbreviation);
    if (domain.idTypeIdentificationDocument !== undefined) {
      orm.idTypeIdentificationDocument = domain.idTypeIdentificationDocument;
    }
    return orm;
  }
}
