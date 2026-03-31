import { Inject, Injectable } from '@nestjs/common';
import { IPaymentPlanRepository } from '../../../domain/repositories/payment-plan.repository';
import { PAYMENT_PLAN_REPOSITORY } from '../../tokens/payment-plan.repository.token';

@Injectable()
export class DeletePaymentPlanUseCase {
  constructor(
    @Inject(PAYMENT_PLAN_REPOSITORY)
    private readonly repository: IPaymentPlanRepository,
  ) {}

  async execute(idPaymentPlan: number): Promise<void> {
    const existing = await this.repository.findById(idPaymentPlan);
    if (!existing) {
      throw new Error('PAYMENT_PLAN_NOT_FOUND');
    }
    const usageCount =
      await this.repository.countPaymentsByPaymentPlanId(idPaymentPlan);
    if (usageCount > 0) {
      throw new Error('PAYMENT_PLAN_IN_USE');
    }
    await this.repository.delete(idPaymentPlan);
  }
}
