import { Inject, Injectable } from '@nestjs/common';
import { AuthContext, ensureCanManageCompanyUsers } from '../../auth/auth-context';
import { ICaseRecordRepository } from '../../../domain/repositories/case-record.repository';
import { CASE_RECORD_REPOSITORY } from '../../tokens/case-record.repository.token';

@Injectable()
export class DeleteCaseRecordUseCase {
  constructor(
    @Inject(CASE_RECORD_REPOSITORY)
    private readonly repository: ICaseRecordRepository,
  ) {}

  async execute(idCase: number, authContext: AuthContext): Promise<void> {
    ensureCanManageCompanyUsers(authContext);
    const existing = await this.repository.findById(idCase);
    if (!existing) {
      throw new Error('CASE_RECORD_NOT_FOUND');
    }
    if (existing.codeCompany !== authContext.companyId) {
      throw new Error('FORBIDDEN_COMPANY_SCOPE');
    }
    await this.repository.delete(idCase);
  }
}
