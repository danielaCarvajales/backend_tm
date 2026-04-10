import { Module } from '@nestjs/common';
import { RegisterClientWithCaseUseCase } from '../application/use-cases/client-registration/register-client-with-case.use-case';
import { RegisterClientController } from './controllers/register-client.controller';
import { CaseRecordModule } from './case-record.module';
import { CredentialsModule } from './credentials.module';
import { CustomerProfileModule } from './customer-profile.module';
import { PersonModule } from './person.module';
import { PersonRoleModule } from './person-role.module';
@Module({
  imports: [
    PersonModule,
    PersonRoleModule,
    CredentialsModule,
    CustomerProfileModule,
    CaseRecordModule,
  ],
  controllers: [RegisterClientController],
  providers: [RegisterClientWithCaseUseCase],
})
export class RegisterClientModule {}
