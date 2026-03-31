import { PersonDocuments } from '../../../../domain/entities/person-documents.entity';
import { PersonDocuments as PersonDocumentsOrm } from '../entities/person-documents/person-documents';

export class PersonDocumentsMapper {
  static toDomain(orm: PersonDocumentsOrm): PersonDocuments {
    return new PersonDocuments(
      orm.idPersonDocuments,
      orm.idPerson,
      orm.idDocument,
    );
  }

  static toOrm(domain: PersonDocuments): PersonDocumentsOrm {
    return new PersonDocumentsOrm(
      domain.idPersonDocuments ?? 0,
      domain.idPerson,
      domain.idDocument,
    );
  }
}
