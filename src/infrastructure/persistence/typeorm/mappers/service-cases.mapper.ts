import { ServiceCases } from '../../../../domain/entities/service-cases.entity';
import { ServiceCases as ServiceCasesOrm } from '../entities/service-cases/service-cases';

export class ServiceCasesMapper {
  static toDomain(orm: ServiceCasesOrm): ServiceCases {
    return new ServiceCases(
      orm.idServiceCases,
      orm.idCase,
      orm.idServices,
      orm.observation ?? null,
      orm.createdAt,
    );
  }

  static toOrm(domain: ServiceCases): ServiceCasesOrm {
    const orm = new ServiceCasesOrm(
      domain.idCase,
      domain.idServices,
      domain.observation ?? '',
    );
    if (domain.idServiceCases !== undefined) {
      (orm as { idServiceCases?: number }).idServiceCases = domain.idServiceCases;
    }
    orm.createdAt = domain.createdAt;
    return orm;
  }
}
