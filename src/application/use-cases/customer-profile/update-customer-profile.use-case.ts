import { Inject, Injectable } from '@nestjs/common';
import { CustomerProfile } from '../../../domain/entities/customer-profile.entity';
import { ICustomerProfileRepository } from '../../../domain/repositories/customer-profile.repository';
import { UpdateCustomerProfileDto } from '../../dto/customer-profile/update-customer-profile.dto';
import { CUSTOMER_PROFILE_REPOSITORY } from '../../tokens/customer-profile.repository.token';

@Injectable()
export class UpdateCustomerProfileUseCase {
  constructor(
    @Inject(CUSTOMER_PROFILE_REPOSITORY)
    private readonly repository: ICustomerProfileRepository,
  ) {}

  async execute(
    idCustomerProfile: number,
    dto: UpdateCustomerProfileDto,
  ): Promise<CustomerProfile> {
    const existing = await this.repository.findById(idCustomerProfile);
    if (!existing) {
      throw new Error('CUSTOMER_PROFILE_NOT_FOUND');
    }
    const updated = new CustomerProfile(
      idCustomerProfile,
      dto.idPersonRole ?? existing.idPersonRole,
      dto.codeCustomer ?? existing.codeCustomer,
      existing.createdAt,
    );
    return this.repository.update(updated);
  }
}
