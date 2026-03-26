import { Person } from '../../../../domain/entities/person.entity';
import { Person as PersonOrm } from '../entities/person/person';

export class PersonMapper {
  // Maps ORM entity to domain entity.
  static toDomain(orm: PersonOrm): Person {
    return new Person(
      orm.idPerson,
      orm.personCode ?? '',
      orm.fullName,
      orm.idTypeDocument,
      orm.documentNumber,
      orm.birthdate,
      orm.idNationality,
      orm.phone,
      orm.email,
    );
  }

  // Maps domain entity to ORM entity (for save/update).
  static toOrm(domain: Person): PersonOrm {
    const orm = new PersonOrm(
      domain.personCode,
      domain.fullName,
      domain.idTypeDocument,
      domain.documentNumber,
      domain.birthdate,
      domain.phone,
      domain.idNationality,
      domain.email,
    );
    if (domain.idPerson !== undefined) {
      orm.idPerson = domain.idPerson;
    }
    return orm;
  }
}
