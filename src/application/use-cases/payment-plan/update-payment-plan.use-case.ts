import { Inject, Injectable } from '@nestjs/common';
import { PaymentPlan } from '../../../domain/entities/payment-plan.entity';
import { IPaymentPlanRepository } from '../../../domain/repositories/payment-plan.repository';
import { UpdatePaymentPlanDto } from '../../dto/payment-plan/update-payment-plan.dto';
import { PAYMENT_PLAN_REPOSITORY } from '../../tokens/payment-plan.repository.token';

@Injectable()
export class UpdatePaymentPlanUseCase {
  constructor(
    @Inject(PAYMENT_PLAN_REPOSITORY)
    private readonly repository: IPaymentPlanRepository,
  ) {}

  async execute(
    idPaymentPlan: number,
    dto: UpdatePaymentPlanDto,
  ): Promise<PaymentPlan> {
    const existing = await this.repository.findById(idPaymentPlan);
    if (!existing) {
      throw new Error('PAYMENT_PLAN_NOT_FOUND');
    }
    const name = dto.name !== undefined ? dto.name.trim() : existing.name;
    let description: string | null;
    if (dto.description !== undefined) {
      description =
        dto.description.trim() !== '' ? dto.description.trim() : null;
    } else {
      description = existing.description;
    }
    const dueDays =
      dto.dueDays !== undefined ? dto.dueDays : existing.dueDays;
    const updated = new PaymentPlan(
      idPaymentPlan,
      name,
      description,
      dueDays,
    );
    return this.repository.update(updated);
  }
}
