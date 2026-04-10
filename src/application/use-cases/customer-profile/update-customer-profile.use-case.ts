import { Inject, Injectable } from '@nestjs/common';
import { CustomerProfile } from '../../../domain/entities/customer-profile.entity';
import { ICustomerProfileRepository } from '../../../domain/repositories/customer-profile.repository';
import { UpdateCustomerProfileDto } from '../../dto/customer-profile/update-customer-profile.dto';
import { CUSTOMER_PROFILE_REPOSITORY } from '../../tokens/customer-profile.repository.token';
import { AuthContext } from '../../auth/auth-context';

@Injectable()
export class UpdateCustomerProfileUseCase {
  constructor(
    @Inject(CUSTOMER_PROFILE_REPOSITORY)
    private readonly repository: ICustomerProfileRepository,
  ) {}

  async execute(
    idCustomerProfile: number,
    dto: UpdateCustomerProfileDto,
    authContext: AuthContext,
  ): Promise<CustomerProfile> {
    const existing = await this.repository.findByIdForCompany(
      idCustomerProfile,
      authContext.companyId,
    );
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
