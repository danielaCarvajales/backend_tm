import { FamilyRelationship } from '../../../../domain/entities/family-relationship.entity';
import { FamilyRelationship as FamilyRelationshipOrm } from '../entities/family-relationship/family-relationship';

export class FamilyRelationshipMapper {
  static toDomain(orm: FamilyRelationshipOrm): FamilyRelationship {
    return new FamilyRelationship(
      orm.idFamilyRelationship,
      orm.nameFamilyRelationship,
    );
  }

  static toOrm(domain: FamilyRelationship): FamilyRelationshipOrm {
    return new FamilyRelationshipOrm(
      domain.idFamilyRelationship ?? 0,
      domain.nameFamilyRelationship,
    );
  }
}
