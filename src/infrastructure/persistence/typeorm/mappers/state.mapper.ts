import { State } from '../../../../domain/entities/state.entity';
import { State as StateOrm } from '../entities/state/state';

export class StateMapper {
  // Maps ORM entity to domain entity.
  static toDomain(orm: StateOrm): State {
    return new State(orm.idState, orm.nameState);
  }

  // Maps domain entity to ORM entity (for save/update).
  static toOrm(domain: State): StateOrm {
    return new StateOrm(domain.idState ?? 0, domain.nameState);
  }
}
