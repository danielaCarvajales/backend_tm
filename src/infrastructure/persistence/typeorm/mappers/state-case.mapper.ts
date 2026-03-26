import { StateCase } from '../../../../domain/entities/state-case.entity';
import { StateCase as StateCaseOrm } from '../entities/state-case/state-case';

export class StateCaseMapper {
  static toDomain(orm: StateCaseOrm): StateCase {
    return new StateCase(orm.idState, orm.nameState);
  }

  static toOrm(domain: StateCase): StateCaseOrm {
    return new StateCaseOrm(domain.idState ?? 0, domain.nameState);
  }
}
