import { CustomerProfile } from '../../../../domain/entities/customer-profile.entity';
import { CustomerProfile as CustomerProfileOrm } from '../entities/customer-profile/customer-profile';

export class CustomerProfileMapper {
  static toDomain(orm: CustomerProfileOrm): CustomerProfile {
    return new CustomerProfile(
      orm.idCustomerProfile,
      orm.idPersonRole,
      orm.codeCustomer,
      orm.createdAt,
    );
  }

  static toOrm(domain: CustomerProfile): CustomerProfileOrm {
    const orm = new CustomerProfileOrm(
      domain.idCustomerProfile ?? 0,
      domain.idPersonRole,
      domain.codeCustomer,
      domain.createdAt,
    );
    if (domain.idCustomerProfile !== undefined) {
      orm.idCustomerProfile = domain.idCustomerProfile;
    }
    return orm;
  }
}
