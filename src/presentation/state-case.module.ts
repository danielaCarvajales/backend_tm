import { Module } from '@nestjs/common';
import { STATE_CASE_REPOSITORY } from '../application/tokens/state-case.repository.token';
import { CreateStateCaseUseCase } from '../application/use-cases/state-case/create-state-case.use-case';
import { DeleteStateCaseUseCase } from '../application/use-cases/state-case/delete-state-case.use-case';
import { GetStateCaseByIdUseCase } from '../application/use-cases/state-case/get-state-case-by-id.use-case';
import { ListStateCasesUseCase } from '../application/use-cases/state-case/list-state-cases.use-case';
import { UpdateStateCaseUseCase } from '../application/use-cases/state-case/update-state-case.use-case';
import { StateCaseController } from './controllers/state-case.controller';
import { StateCaseTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/state-case.repository';

@Module({
  controllers: [StateCaseController],
  providers: [
    {
      provide: STATE_CASE_REPOSITORY,
      useClass: StateCaseTypeOrmRepository,
    },
    CreateStateCaseUseCase,
    UpdateStateCaseUseCase,
    DeleteStateCaseUseCase,
    GetStateCaseByIdUseCase,
    ListStateCasesUseCase,
  ],
  exports: [STATE_CASE_REPOSITORY],
})
export class StateCaseModule {}
