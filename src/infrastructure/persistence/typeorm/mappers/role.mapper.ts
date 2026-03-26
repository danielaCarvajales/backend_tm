import { Role } from '../../../../domain/entities/role.entity';
import { Role as RoleOrm } from '../entities/role/role';

export class RoleMapper {
  static toDomain(orm: RoleOrm): Role {
    return new Role(orm.idRole, orm.name);
  }

  static toOrm(domain: Role): RoleOrm {
    const orm = new RoleOrm(domain.idRole ?? 0, domain.name);
    if (domain.idRole !== undefined) {
      orm.idRole = domain.idRole;
    }
    return orm;
  }
}
