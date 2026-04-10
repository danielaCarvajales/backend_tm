import { Inject, Injectable } from '@nestjs/common';
import { ICompanyRepository } from '../../../domain/repositories/company.repository';
import { COMPANY_REPOSITORY } from '../../tokens/company.repository.token';
import { AuthContext, ensureSuperAdmin } from '../../auth/auth-context';

@Injectable()
export class DeleteCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly repository: ICompanyRepository,
  ) {}

  async execute(codeCompany: number, authContext: AuthContext): Promise<void> {
    ensureSuperAdmin(authContext);
    const existing = await this.repository.findById(codeCompany);
    if (!existing) {
      throw new Error('COMPANY_NOT_FOUND');
    }
    await this.repository.delete(codeCompany);
  }
}
