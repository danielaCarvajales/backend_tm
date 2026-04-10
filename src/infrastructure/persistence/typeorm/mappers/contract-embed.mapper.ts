import { CaseRecordContractItem } from '../../../../domain/repositories/case-record.repository';
import { Contract as ContractOrm } from '../entities/contract/contract';

export function mapCaseRecordContracts(
  contracts?: ContractOrm[],
): CaseRecordContractItem[] {
  return (contracts ?? []).map((c) => ({
    idContract: c.idContract,
    contractCode: c.contractCode,
    idCase: c.idCase,
    digitalSignature: c.digitalSignature ?? null,
    createdAt: c.createdAt,
  }));
}
