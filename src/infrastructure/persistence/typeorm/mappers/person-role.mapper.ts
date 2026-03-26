import { PersonRole } from '../../../../domain/entities/person-role.entity';
import { PersonRole as PersonRoleOrm } from '../entities/person-role/person-role';

export class PersonRoleMapper {
  static toDomain(orm: PersonRoleOrm): PersonRole {
    return new PersonRole(
      orm.idPersonRole,
      orm.idPerson,
      orm.idRole,
      orm.codeCompany,
      orm.idState,
      orm.assignmentDate,
      orm.revocationDate ?? null,
    );
  }

  static toOrm(domain: PersonRole): PersonRoleOrm {
    const orm = new PersonRoleOrm(
      domain.idPerson,
      domain.idRole,
      domain.codeCompany,
      domain.idState,
      domain.assignmentDate,
      domain.revocationDate ?? undefined,
    );
    if (domain.idPersonRole !== undefined) {
      orm.idPersonRole = domain.idPersonRole;
    }
    return orm;
  }
}
