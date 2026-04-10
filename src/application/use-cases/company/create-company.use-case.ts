import { Inject, Injectable } from '@nestjs/common';
import { Company } from '../../../domain/entities/company.entity';
import { ICompanyRepository } from '../../../domain/repositories/company.repository';
import { CreateCompanyDto } from '../../dto/company/create-company.dto';
import { COMPANY_REPOSITORY } from '../../tokens/company.repository.token';
import { AuthContext, ensureSuperAdmin } from '../../auth/auth-context';

@Injectable()
export class CreateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly repository: ICompanyRepository,
  ) {}

  async execute(dto: CreateCompanyDto, authContext: AuthContext): Promise<Company> {
    ensureSuperAdmin(authContext);
    const entity = new Company(
      undefined,
      dto.nameCompany,
      dto.prefixCompany,
      dto.stateCompany ?? 1,
    );
    return this.repository.save(entity);
  }
}
