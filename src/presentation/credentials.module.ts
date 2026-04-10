import { Module } from '@nestjs/common';
import { CREDENTIALS_REPOSITORY } from '../application/tokens/credentials.repository.token';
import { CreateCredentialsUseCase } from '../application/use-cases/credentials/create-credentials.use-case';
import { DeleteCredentialsUseCase } from '../application/use-cases/credentials/delete-credentials.use-case';
import { GetCredentialsByIdUseCase } from '../application/use-cases/credentials/get-credentials-by-id.use-case';
import { ListCredentialsUseCase } from '../application/use-cases/credentials/list-credentials.use-case';
import { UpdateCredentialsUseCase } from '../application/use-cases/credentials/update-credentials.use-case';
import { CredentialsController } from './controllers/credentials.controller';
import { CredentialsTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/credentials.repository';
import { EmailModule } from './email.module';
import { PersonModule } from './person.module';

@Module({
  imports: [EmailModule, PersonModule],
  controllers: [CredentialsController],
  providers: [
    {
      provide: CREDENTIALS_REPOSITORY,
      useClass: CredentialsTypeOrmRepository,
    },
    CreateCredentialsUseCase,
    UpdateCredentialsUseCase,
    DeleteCredentialsUseCase,
    GetCredentialsByIdUseCase,
    ListCredentialsUseCase,
  ],
  exports: [CreateCredentialsUseCase],
})
export class CredentialsModule {}
