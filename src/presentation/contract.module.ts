import { Module } from '@nestjs/common';
import { CONTRACT_REPOSITORY } from '../application/tokens/contract.repository.token';
import { CreateContractUseCase } from '../application/use-cases/contract/create-contract.use-case';
import { DeleteContractUseCase } from '../application/use-cases/contract/delete-contract.use-case';
import { GetContractByIdUseCase } from '../application/use-cases/contract/get-contract-by-id.use-case';
import { ListContractsByCaseUseCase } from '../application/use-cases/contract/list-contracts-by-case.use-case';
import { ListContractsUseCase } from '../application/use-cases/contract/list-contracts.use-case';
import { UpdateContractUseCase } from '../application/use-cases/contract/update-contract.use-case';
import { ContractTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/contract.repository';
import { CaseRecordModule } from './case-record.module';
import { ContractController } from './controllers/contract.controller';
import { PersonModule } from './person.module';

@Module({
  imports: [PersonModule, CaseRecordModule],
  controllers: [ContractController],
  providers: [
    {
      provide: CONTRACT_REPOSITORY,
      useClass: ContractTypeOrmRepository,
    },
    CreateContractUseCase,
    UpdateContractUseCase,
    DeleteContractUseCase,
    GetContractByIdUseCase,
    ListContractsUseCase,
    ListContractsByCaseUseCase,
  ],
  exports: [CONTRACT_REPOSITORY, GetContractByIdUseCase],
})
export class ContractModule {}
