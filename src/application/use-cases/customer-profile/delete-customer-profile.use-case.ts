import { Inject, Injectable } from '@nestjs/common';
import { ICustomerProfileRepository } from '../../../domain/repositories/customer-profile.repository';
import { CUSTOMER_PROFILE_REPOSITORY } from '../../tokens/customer-profile.repository.token';

@Injectable()
export class DeleteCustomerProfileUseCase {
  constructor(
    @Inject(CUSTOMER_PROFILE_REPOSITORY)
    private readonly repository: ICustomerProfileRepository,
  ) {}

  async execute(idCustomerProfile: number): Promise<void> {
    const existing = await this.repository.findById(idCustomerProfile);
    if (!existing) {
      throw new Error('CUSTOMER_PROFILE_NOT_FOUND');
    }
    await this.repository.delete(idCustomerProfile);
  }
}
