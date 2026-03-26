import { ServiceCompany } from '../../../../domain/entities/service-company.entity';
import { ServiceCompany as ServiceCompanyOrm } from '../entities/service-company/service-company';

export class ServiceCompanyMapper {
  static toDomain(orm: ServiceCompanyOrm): ServiceCompany {
    return new ServiceCompany(
      orm.idServices,
      orm.codeCompany,
      orm.name,
      orm.description,
    );
  }

  static toOrm(domain: ServiceCompany): ServiceCompanyOrm {
    return new ServiceCompanyOrm(
      domain.idService ?? 0,
      domain.codeCompany,
      domain.name,
      domain.description,
    );
  }
}
