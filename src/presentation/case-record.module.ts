import { Module } from '@nestjs/common';
import { CASE_RECORD_REPOSITORY } from '../application/tokens/case-record.repository.token';
import { SERVICE_CASES_REPOSITORY } from '../application/tokens/service-cases.repository.token';
import { StateCaseModule } from './state-case.module';
import { ServiceCompanyModule } from './service-company.module';
import { CreateCaseRecordUseCase } from '../application/use-cases/case-record/create-case-record.use-case';
import { DeleteCaseRecordUseCase } from '../application/use-cases/case-record/delete-case-record.use-case';
import { GetCaseRecordByIdUseCase } from '../application/use-cases/case-record/get-case-record-by-id.use-case';
import { GetCurrentCaseUseCase } from '../application/use-cases/case-record/get-current-case.use-case';
import { ListCaseRecordsUseCase } from '../application/use-cases/case-record/list-case-records.use-case';
import { UpdateCaseRecordUseCase } from '../application/use-cases/case-record/update-case-record.use-case';
import { CaseRecordController } from './controllers/case-record.controller';
import { CaseRecordTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/case-record.repository';
import { ServiceCasesTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/service-cases.repository';
import { CaseRecordService } from '../domain/services/case-record.service';
import { EmailModule } from './email.module';
import { PersonModule } from './person.module';

@Module({
  imports: [StateCaseModule, EmailModule, PersonModule, ServiceCompanyModule],
  controllers: [CaseRecordController],
  exports: [
    GetCurrentCaseUseCase,
    GetCaseRecordByIdUseCase,
    CASE_RECORD_REPOSITORY,
    CreateCaseRecordUseCase,
  ],
  providers: [
    {
      provide: CASE_RECORD_REPOSITORY,
      useClass: CaseRecordTypeOrmRepository,
    },
    {
      provide: SERVICE_CASES_REPOSITORY,
      useClass: ServiceCasesTypeOrmRepository,
    },
    CaseRecordService,
    CreateCaseRecordUseCase,
    UpdateCaseRecordUseCase,
    DeleteCaseRecordUseCase,
    GetCaseRecordByIdUseCase,
    GetCurrentCaseUseCase,
    ListCaseRecordsUseCase,
  ],
})
export class CaseRecordModule {}
