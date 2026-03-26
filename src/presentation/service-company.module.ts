import { Module } from '@nestjs/common';
import { SERVICE_COMPANY_REPOSITORY } from '../application/tokens/service-company.repository.token';
import { CreateServiceCompanyUseCase } from '../application/use-cases/service-company/create-service-company.use-case';
import { DeleteServiceCompanyUseCase } from '../application/use-cases/service-company/delete-service-company.use-case';
import { GetServiceCompanyByIdUseCase } from '../application/use-cases/service-company/get-service-company-by-id.use-case';
import { ListServiceCompaniesUseCase } from '../application/use-cases/service-company/list-service-companies.use-case';
import { UpdateServiceCompanyUseCase } from '../application/use-cases/service-company/update-service-company.use-case';
import { ServiceCompanyController } from './controllers/service-company.controller';
import { ServiceCompanyTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/service-company.repository';

@Module({
  controllers: [ServiceCompanyController],
  exports: [SERVICE_COMPANY_REPOSITORY],
  providers: [
    {
      provide: SERVICE_COMPANY_REPOSITORY,
      useClass: ServiceCompanyTypeOrmRepository,
    },
    CreateServiceCompanyUseCase,
    UpdateServiceCompanyUseCase,
    DeleteServiceCompanyUseCase,
    GetServiceCompanyByIdUseCase,
    ListServiceCompaniesUseCase,
  ],
})
export class ServiceCompanyModule {}
