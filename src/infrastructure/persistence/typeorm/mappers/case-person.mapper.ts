import { CasePerson } from '../../../../domain/entities/case-person.entity';
import { CasePerson as CasePersonOrm } from '../entities/case-person/case-person';

export class CasePersonMapper {
  static toDomain(orm: CasePersonOrm): CasePerson {
    return new CasePerson(
      orm.idCasePerson,
      orm.idCase,
      orm.idPerson,
      orm.idFamilyRelationship,
      orm.statePerson,
      orm.createdAt,
      orm.observation ?? null,
    );
  }

  static toOrm(domain: CasePerson): CasePersonOrm {
    return new CasePersonOrm(
      domain.idCasePerson ?? 0,
      domain.idCase,
      domain.idPerson,
      domain.idFamilyRelationship,
      domain.statePerson,
      domain.createdAt,
      domain.observation ?? '',
    );
  }
}
