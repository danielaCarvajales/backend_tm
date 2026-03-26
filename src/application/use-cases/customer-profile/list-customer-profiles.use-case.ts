import { Inject, Injectable } from '@nestjs/common';
import {
  CustomerProfileListQuery,
  CustomerProfilePaginatedResult,
} from '../../../domain/repositories/customer-profile.repository';
import { CustomerProfile } from '../../../domain/entities/customer-profile.entity';
import { ICustomerProfileRepository } from '../../../domain/repositories/customer-profile.repository';
import { QueryCustomerProfileDto } from '../../dto/customer-profile/query-customer-profile.dto';
import { CUSTOMER_PROFILE_REPOSITORY } from '../../tokens/customer-profile.repository.token';

@Injectable()
export class ListCustomerProfilesUseCase {
  constructor(
    @Inject(CUSTOMER_PROFILE_REPOSITORY)
    private readonly repository: ICustomerProfileRepository,
  ) {}

  async execute(
    query: QueryCustomerProfileDto,
  ): Promise<CustomerProfilePaginatedResult<CustomerProfile>> {
    const domainQuery: CustomerProfileListQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      search: query.search,
    };
    return this.repository.findPaginated(domainQuery);
  }
}
