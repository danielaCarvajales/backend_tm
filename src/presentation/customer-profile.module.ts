import { Module } from '@nestjs/common';
import { CustomerProfileService } from '../domain/services/customer-profile.service';
import { CUSTOMER_PROFILE_REPOSITORY } from '../application/tokens/customer-profile.repository.token';
import { CreateCustomerProfileUseCase } from '../application/use-cases/customer-profile/create-customer-profile.use-case';
import { DeleteCustomerProfileUseCase } from '../application/use-cases/customer-profile/delete-customer-profile.use-case';
import { GetCustomerProfileByIdUseCase } from '../application/use-cases/customer-profile/get-customer-profile-by-id.use-case';
import { ListCustomerProfilesUseCase } from '../application/use-cases/customer-profile/list-customer-profiles.use-case';
import { UpdateCustomerProfileUseCase } from '../application/use-cases/customer-profile/update-customer-profile.use-case';
import { CustomerProfileController } from './controllers/customer-profile.controller';
import { CustomerProfileTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/customer-profile.repository';

@Module({
  controllers: [CustomerProfileController],
  providers: [
    CustomerProfileService,
    {
      provide: CUSTOMER_PROFILE_REPOSITORY,
      useClass: CustomerProfileTypeOrmRepository,
    },
    CreateCustomerProfileUseCase,
    UpdateCustomerProfileUseCase,
    DeleteCustomerProfileUseCase,
    GetCustomerProfileByIdUseCase,
    ListCustomerProfilesUseCase,
  ],
  exports: [CUSTOMER_PROFILE_REPOSITORY],
})
export class CustomerProfileModule {}
