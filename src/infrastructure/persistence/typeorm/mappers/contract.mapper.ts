import { Contract } from '../../../../domain/entities/contract.entity';
import { Contract as ContractOrm } from '../entities/contract/contract';

export class ContractMapper {
  static toDomain(orm: ContractOrm): Contract {
    return new Contract(
      orm.idContract,
      orm.contractCode,
      orm.idCase,
      orm.digitalSignature ?? null,
      orm.createdAt,
    );
  }

  static toOrm(domain: Contract): ContractOrm {
    return new ContractOrm(
      domain.idContract ?? 0,
      domain.contractCode,
      domain.idCase,
      domain.digitalSignature ?? '',
      domain.createdAt,
    );
  }
}