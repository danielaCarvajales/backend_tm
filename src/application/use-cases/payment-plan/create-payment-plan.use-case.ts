import { Inject, Injectable } from '@nestjs/common';
import { PaymentPlan } from '../../../domain/entities/payment-plan.entity';
import { IPaymentPlanRepository } from '../../../domain/repositories/payment-plan.repository';
import { CreatePaymentPlanDto } from '../../dto/payment-plan/create-payment-plan.dto';
import { PAYMENT_PLAN_REPOSITORY } from '../../tokens/payment-plan.repository.token';

@Injectable()
export class CreatePaymentPlanUseCase {
  constructor(
    @Inject(PAYMENT_PLAN_REPOSITORY)
    private readonly repository: IPaymentPlanRepository,
  ) {}

  async execute(dto: CreatePaymentPlanDto): Promise<PaymentPlan> {
    const description =
      dto.description != null && dto.description.trim() !== ''
        ? dto.description.trim()
        : null;
    const entity = new PaymentPlan(
      undefined,
      dto.name.trim(),
      description,
      dto.dueDays,
    );
    return this.repository.save(entity);
  }
}
