import { Inject, Injectable } from '@nestjs/common';
import { ICustomerProfileRepository } from '../../../domain/repositories/customer-profile.repository';
import { CUSTOMER_PROFILE_REPOSITORY } from '../../tokens/customer-profile.repository.token';
import { AuthContext } from '../../auth/auth-context';

@Injectable()
export class DeleteCustomerProfileUseCase {
  constructor(
    @Inject(CUSTOMER_PROFILE_REPOSITORY)
    private readonly repository: ICustomerProfileRepository,
  ) {}

  async execute(
    idCustomerProfile: number,
    authContext: AuthContext,
  ): Promise<void> {
    const existing = await this.repository.findByIdForCompany(
      idCustomerProfile,
      authContext.companyId,
    );
    if (!existing) {
      throw new Error('CUSTOMER_PROFILE_NOT_FOUND');
    }
    await this.repository.delete(idCustomerProfile);
  }
}
