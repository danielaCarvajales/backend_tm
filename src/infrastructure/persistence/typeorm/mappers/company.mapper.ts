import { Company } from '../../../../domain/entities/company.entity';
import { Company as CompanyOrm } from '../entities/company/company';

export class CompanyMapper {
  // Maps ORM entity to domain entity.
  static toDomain(orm: CompanyOrm): Company {
    return new Company(
      orm.codeCompany,
      orm.nameCompany,
      orm.prefixCompany,
      orm.stateCompany,
    );
  }

  // Maps domain entity to ORM entity (for save/update).
  static toOrm(domain: Company): CompanyOrm {
    const orm = new CompanyOrm(
      domain.codeCompany ?? 0,
      domain.nameCompany,
      domain.prefixCompany,
      domain.stateCompany,
    );
    if (domain.codeCompany !== undefined) {
      orm.codeCompany = domain.codeCompany;
    }
    return orm;
  }
}
