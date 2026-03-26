import { Module } from '@nestjs/common';
import { NATIONALITY_REPOSITORY } from '../application/tokens/nationality.repository.token';
import { CreateNationalityUseCase } from '../application/use-cases/nationality/create-nationality.use-case';
import { DeleteNationalityUseCase } from '../application/use-cases/nationality/delete-nationality.use-case';
import { GetNationalityByIdUseCase } from '../application/use-cases/nationality/get-nationality-by-id.use-case';
import { ListNationalitiesUseCase } from '../application/use-cases/nationality/list-nationalities.use-case';
import { UpdateNationalityUseCase } from '../application/use-cases/nationality/update-nationality.use-case';
import { NationalityController } from './controllers/nationality.controller';
import { NationalityTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/nationality.repository';

@Module({
  controllers: [NationalityController],
  providers: [
    {
      provide: NATIONALITY_REPOSITORY,
      useClass: NationalityTypeOrmRepository,
    },
    CreateNationalityUseCase,
    UpdateNationalityUseCase,
    DeleteNationalityUseCase,
    GetNationalityByIdUseCase,
    ListNationalitiesUseCase,
  ],
})
export class NationalityModule {}
