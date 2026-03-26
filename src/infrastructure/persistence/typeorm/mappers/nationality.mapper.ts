import { Nationality } from '../../../../domain/entities/nationality.entity';
import { Nacionality } from '../entities/nacionality/nacionality';

export class NationalityMapper {
  // Infrastructure Mapper: Nationality (Domain ↔ ORM)
  static toDomain(orm: Nacionality): Nationality {
    return new Nationality(orm.idNacionality, orm.name, orm.abbreviation);
  }

  // Maps domain entity to ORM entity (for save/update).
  static toOrm(domain: Nationality): Nacionality {
    const orm = new Nacionality(domain.name, domain.abbreviation);
    if (domain.idNacionality !== undefined) {
      orm.idNacionality = domain.idNacionality;
    }
    return orm;
  }
}
