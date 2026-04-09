import { Module } from '@nestjs/common';
import { CASE_RECORD_REPOSITORY } from '../application/tokens/case-record.repository.token';
import { StateCaseModule } from './state-case.module';
import { CreateCaseRecordUseCase } from '../application/use-cases/case-record/create-case-record.use-case';
import { DeleteCaseRecordUseCase } from '../application/use-cases/case-record/delete-case-record.use-case';
import { GetCaseRecordByIdUseCase } from '../application/use-cases/case-record/get-case-record-by-id.use-case';
import { GetOrCreateCurrentCaseUseCase } from '../application/use-cases/case-record/get-or-create-current-case.use-case';
import { ListCaseRecordsUseCase } from '../application/use-cases/case-record/list-case-records.use-case';
import { UpdateCaseRecordUseCase } from '../application/use-cases/case-record/update-case-record.use-case';
import { CaseRecordController } from './controllers/case-record.controller';
import { CaseRecordTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/case-record.repository';
import { CaseRecordService } from '../domain/services/case-record.service';
import { EmailModule } from './email.module';
import { PersonModule } from './person.module';

@Module({
  imports: [StateCaseModule, EmailModule, PersonModule],
  controllers: [CaseRecordController],
  exports: [
    GetOrCreateCurrentCaseUseCase,
    GetCaseRecordByIdUseCase,
    CASE_RECORD_REPOSITORY,
  ],
  providers: [
    {
      provide: CASE_RECORD_REPOSITORY,
      useClass: CaseRecordTypeOrmRepository,
    },
    CaseRecordService,
    CreateCaseRecordUseCase,
    UpdateCaseRecordUseCase,
    DeleteCaseRecordUseCase,
    GetCaseRecordByIdUseCase,
    GetOrCreateCurrentCaseUseCase,
    ListCaseRecordsUseCase,
  ],
})
export class CaseRecordModule {}
