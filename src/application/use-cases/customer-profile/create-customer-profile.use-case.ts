import { Inject, Injectable } from '@nestjs/common';
import { CustomerProfile } from '../../../domain/entities/customer-profile.entity';
import { ICustomerProfileRepository } from '../../../domain/repositories/customer-profile.repository';
import { IPersonRoleRepository } from '../../../domain/repositories/person-role.repository';
import { CustomerProfileService } from '../../../domain/services/customer-profile.service';
import { AuthContext, ensureCompanyAccess } from '../../auth/auth-context';
import { CreateCustomerProfileDto } from '../../dto/customer-profile/create-customer-profile.dto';
import { CUSTOMER_PROFILE_REPOSITORY } from '../../tokens/customer-profile.repository.token';
import { PERSON_ROLE_REPOSITORY } from '../../tokens/person-role.repository.token';
import { nowColombia } from '../../../infrastructure/utils/date.util';

const MAX_UNIQUE_CODE_ATTEMPTS = 10;

@Injectable()
export class CreateCustomerProfileUseCase {
  constructor(
    @Inject(CUSTOMER_PROFILE_REPOSITORY)
    private readonly repository: ICustomerProfileRepository,
    @Inject(PERSON_ROLE_REPOSITORY)
    private readonly personRoles: IPersonRoleRepository,
    private readonly customerProfileService: CustomerProfileService,
  ) {}

  async execute(
    dto: CreateCustomerProfileDto,
    authContext: AuthContext,
  ): Promise<CustomerProfile> {
    const pr = await this.personRoles.findById(dto.idPersonRole);
    if (!pr) {
      throw new Error('PERSON_ROLE_NOT_FOUND');
    }
    ensureCompanyAccess(authContext, pr.codeCompany);
    const codeCustomer = await this.generateUniqueCodeCustomer();
    const entity = new CustomerProfile(
      undefined,
      dto.idPersonRole,
      codeCustomer,
      nowColombia(),
    );
    return this.repository.save(entity);
  }

  private async generateUniqueCodeCustomer(): Promise<string> {
    for (let attempt = 0; attempt < MAX_UNIQUE_CODE_ATTEMPTS; attempt++) {
      const code = this.customerProfileService.generateCustomerCode();
      const existing = await this.repository.findByCodeCustomer(code);
      if (!existing) {
        return code;
      }
    }
    throw new Error('CUSTOMER_CODE_GENERATION_FAILED');
  }
}
