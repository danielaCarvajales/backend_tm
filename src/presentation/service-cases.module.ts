import { Module } from '@nestjs/common';
import { SERVICE_CASES_REPOSITORY } from '../application/tokens/service-cases.repository.token';
import { CreateServiceCasesUseCase } from '../application/use-cases/service-cases/create-service-cases.use-case';
import { DeleteServiceCasesUseCase } from '../application/use-cases/service-cases/delete-service-cases.use-case';
import { GetServiceCasesByIdUseCase } from '../application/use-cases/service-cases/get-service-cases-by-id.use-case';
import { ListServiceCasesUseCase } from '../application/use-cases/service-cases/list-service-cases.use-case';
import { UpdateServiceCasesUseCase } from '../application/use-cases/service-cases/update-service-cases.use-case';
import { ServiceCasesController } from './controllers/service-cases.controller';
import { ServiceCasesTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/service-cases.repository';
import { CaseRecordModule } from './case-record.module';
import { ServiceCompanyModule } from './service-company.module';

@Module({
  imports: [CaseRecordModule, ServiceCompanyModule],
  controllers: [ServiceCasesController],
  providers: [
    {
      provide: SERVICE_CASES_REPOSITORY,
      useClass: ServiceCasesTypeOrmRepository,
    },
    CreateServiceCasesUseCase,
    UpdateServiceCasesUseCase,
    DeleteServiceCasesUseCase,
    GetServiceCasesByIdUseCase,
    ListServiceCasesUseCase,
  ],
})
export class ServiceCasesModule {}
