import { Inject, Injectable } from '@nestjs/common';
import { PaymentPlan } from '../../../domain/entities/payment-plan.entity';
import { IPaymentPlanRepository } from '../../../domain/repositories/payment-plan.repository';
import { PAYMENT_PLAN_REPOSITORY } from '../../tokens/payment-plan.repository.token';

@Injectable()
export class GetPaymentPlanByIdUseCase {
  constructor(
    @Inject(PAYMENT_PLAN_REPOSITORY)
    private readonly repository: IPaymentPlanRepository,
  ) {}

  async execute(idPaymentPlan: number): Promise<PaymentPlan | null> {
    return this.repository.findById(idPaymentPlan);
  }
}
