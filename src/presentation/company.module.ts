import { Module } from '@nestjs/common';
import { COMPANY_REPOSITORY } from '../application/tokens/company.repository.token';
import { CreateCompanyUseCase } from '../application/use-cases/company/create-company.use-case';
import { DeleteCompanyUseCase } from '../application/use-cases/company/delete-company.use-case';
import { GetCompanyByIdUseCase } from '../application/use-cases/company/get-company-by-id.use-case';
import { ListCompaniesUseCase } from '../application/use-cases/company/list-companies.use-case';
import { UpdateCompanyUseCase } from '../application/use-cases/company/update-company.use-case';
import { CompanyController } from './controllers/company.controller';
import { CompanyTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/company.repository';

@Module({
  controllers: [CompanyController],
  providers: [
    {
      provide: COMPANY_REPOSITORY,
      useClass: CompanyTypeOrmRepository,
    },
    CreateCompanyUseCase,
    UpdateCompanyUseCase,
    DeleteCompanyUseCase,
    GetCompanyByIdUseCase,
    ListCompaniesUseCase,
  ],
})
export class CompanyModule {}
