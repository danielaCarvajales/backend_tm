import { Module } from '@nestjs/common';
import { PAYMENT_PLAN_REPOSITORY } from '../application/tokens/payment-plan.repository.token';
import { CreatePaymentPlanUseCase } from '../application/use-cases/payment-plan/create-payment-plan.use-case';
import { DeletePaymentPlanUseCase } from '../application/use-cases/payment-plan/delete-payment-plan.use-case';
import { GetPaymentPlanByIdUseCase } from '../application/use-cases/payment-plan/get-payment-plan-by-id.use-case';
import { ListPaymentPlansUseCase } from '../application/use-cases/payment-plan/list-payment-plans.use-case';
import { UpdatePaymentPlanUseCase } from '../application/use-cases/payment-plan/update-payment-plan.use-case';
import { PaymentPlanController } from './controllers/payment-plan.controller';
import { PaymentPlanTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/payment-plan.repository';

@Module({
  controllers: [PaymentPlanController],
  providers: [
    {
      provide: PAYMENT_PLAN_REPOSITORY,
      useClass: PaymentPlanTypeOrmRepository,
    },
    CreatePaymentPlanUseCase,
    UpdatePaymentPlanUseCase,
    DeletePaymentPlanUseCase,
    GetPaymentPlanByIdUseCase,
    ListPaymentPlansUseCase,
  ],
  exports: [PAYMENT_PLAN_REPOSITORY],
})
export class PaymentPlanModule {}
