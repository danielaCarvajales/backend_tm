import { Inject, Injectable } from '@nestjs/common';
import { Company } from '../../../domain/entities/company.entity';
import { ICompanyRepository } from '../../../domain/repositories/company.repository';
import { COMPANY_REPOSITORY } from '../../tokens/company.repository.token';

@Injectable()
export class GetCompanyByIdUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly repository: ICompanyRepository,
  ) {}

  async execute(codeCompany: number): Promise<Company | null> {
    return this.repository.findById(codeCompany);
  }
}
