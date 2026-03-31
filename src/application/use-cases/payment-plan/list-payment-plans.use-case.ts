import { Inject, Injectable } from '@nestjs/common';
import { PaymentPlan } from '../../../domain/entities/payment-plan.entity';
import {
  IPaymentPlanRepository,
  PaginatedResult,
  PaymentPlanListQuery,
} from '../../../domain/repositories/payment-plan.repository';
import { QueryPaymentPlanDto } from '../../dto/payment-plan/query-payment-plan.dto';
import { PAYMENT_PLAN_REPOSITORY } from '../../tokens/payment-plan.repository.token';

@Injectable()
export class ListPaymentPlansUseCase {
  constructor(
    @Inject(PAYMENT_PLAN_REPOSITORY)
    private readonly repository: IPaymentPlanRepository,
  ) {}

  async execute(
    query: QueryPaymentPlanDto,
  ): Promise<PaginatedResult<PaymentPlan>> {
    const domainQuery: PaymentPlanListQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      search: query.search,
    };
    return this.repository.findPaginated(domainQuery);
  }
}
