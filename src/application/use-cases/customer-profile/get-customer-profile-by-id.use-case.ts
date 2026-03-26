import { Inject, Injectable } from '@nestjs/common';
import { CustomerProfile } from '../../../domain/entities/customer-profile.entity';
import { ICustomerProfileRepository } from '../../../domain/repositories/customer-profile.repository';
import { CUSTOMER_PROFILE_REPOSITORY } from '../../tokens/customer-profile.repository.token';

@Injectable()
export class GetCustomerProfileByIdUseCase {
  constructor(
    @Inject(CUSTOMER_PROFILE_REPOSITORY)
    private readonly repository: ICustomerProfileRepository,
  ) {}

  async execute(idCustomerProfile: number): Promise<CustomerProfile | null> {
    return this.repository.findById(idCustomerProfile);
  }
}
