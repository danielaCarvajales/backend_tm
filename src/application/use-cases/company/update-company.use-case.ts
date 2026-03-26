import { Inject, Injectable } from '@nestjs/common';
import { Company } from '../../../domain/entities/company.entity';
import { ICompanyRepository } from '../../../domain/repositories/company.repository';
import { UpdateCompanyDto } from '../../dto/company/update-company.dto';
import { COMPANY_REPOSITORY } from '../../tokens/company.repository.token';

@Injectable()
export class UpdateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly repository: ICompanyRepository,
  ) {}

  async execute(codeCompany: number, dto: UpdateCompanyDto): Promise<Company> {
    const existing = await this.repository.findById(codeCompany);
    if (!existing) {
      throw new Error('COMPANY_NOT_FOUND');
    }
    const updated = new Company(
      codeCompany,
      dto.nameCompany ?? existing.nameCompany,
      dto.prefixCompany ?? existing.prefixCompany,
      dto.stateCompany ?? existing.stateCompany,
    );
    return this.repository.update(updated);
  }
}
