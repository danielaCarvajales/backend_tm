import { Module } from '@nestjs/common';
import { STATE_REPOSITORY } from '../application/tokens/state.repository.token';
import { CreateStateUseCase } from '../application/use-cases/state/create-state.use-case';
import { DeleteStateUseCase } from '../application/use-cases/state/delete-state.use-case';
import { GetStateByIdUseCase } from '../application/use-cases/state/get-state-by-id.use-case';
import { ListStatesUseCase } from '../application/use-cases/state/list-states.use-case';
import { UpdateStateUseCase } from '../application/use-cases/state/update-state.use-case';
import { StateController } from './controllers/state.controller';
import { StateTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/state.repository';

@Module({
  controllers: [StateController],
  providers: [
    {
      provide: STATE_REPOSITORY,
      useClass: StateTypeOrmRepository,
    },
    CreateStateUseCase,
    UpdateStateUseCase,
    DeleteStateUseCase,
    GetStateByIdUseCase,
    ListStatesUseCase,
  ],
})
export class StateModule {}
