import { CaseRecord } from '../../../../domain/entities/case-record.entity';
import { CaseRecord as CaseRecordOrm } from '../entities/case-record/case-record';

export class CaseRecordMapper {
  static toDomain(orm: CaseRecordOrm): CaseRecord {
    return new CaseRecord(
      orm.idCase,
      orm.caseCode,
      orm.holder,
      orm.agent ?? null,
      orm.codeCompany,
      String(orm.amount),
      orm.idStateCase,
      orm.createdAt,
      orm.closingDate ?? null,
    );
  }

  static toOrm(domain: CaseRecord): CaseRecordOrm {
    return new CaseRecordOrm(
      domain.idCase ?? 0,
      domain.caseCode,
      domain.holder,
      domain.agent,
      domain.codeCompany,
      domain.amount,
      domain.idStateCase,
      domain.createdAt,
      domain.closingDate,
    );
  }
}
