import { Inject, Injectable } from '@nestjs/common';
import { Company } from '../../../domain/entities/company.entity';
import { ICompanyRepository } from '../../../domain/repositories/company.repository';
import { CreateCompanyDto } from '../../dto/company/create-company.dto';
import { COMPANY_REPOSITORY } from '../../tokens/company.repository.token';

@Injectable()
export class CreateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly repository: ICompanyRepository,
  ) {}

  async execute(dto: CreateCompanyDto): Promise<Company> {
    const entity = new Company(
      undefined,
      dto.nameCompany,
      dto.prefixCompany,
      dto.stateCompany ?? 1,
    );
    return this.repository.save(entity);
  }
}
