import { Credentials } from '../../../../domain/entities/credentials.entity';
import { Credentials as CredentialsOrm } from '../entities/credentials/credentials';

export class CredentialsMapper {
  // Maps ORM entity to domain entity.
  static toDomain(orm: CredentialsOrm): Credentials {
    return new Credentials(
      orm.id,
      orm.username,
      orm.password,
      orm.state,
      orm.lastAccess,
      orm.idPerson,
      orm.codeCompany,
      orm.failedAttempts,
      orm.accountLockedUntil ?? null,
    );
  }

  // Maps domain entity to ORM entity (for save/update).
  static toOrm(domain: Credentials): CredentialsOrm {
    const orm = new CredentialsOrm(
      domain.id ?? 0,
      domain.username,
      domain.password,
      domain.state,
      domain.lastAccess,
      domain.idPerson,
      domain.codeCompany,
      domain.failedAttempts,
      domain.accountLockedUntil,
    );
    if (domain.id !== undefined) {
      orm.id = domain.id;
    }
    return orm;
  }
}
