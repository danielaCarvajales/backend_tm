import { Module } from '@nestjs/common';
import { PAYMENT_REPOSITORY } from '../application/tokens/payment.repository.token';
import { CreatePaymentUseCase } from '../application/use-cases/payment/create-payment.use-case';
import { DeletePaymentUseCase } from '../application/use-cases/payment/delete-payment.use-case';
import { GetPaymentByIdUseCase } from '../application/use-cases/payment/get-payment-by-id.use-case';
import { ListPaymentsByContractUseCase } from '../application/use-cases/payment/list-payments-by-contract.use-case';
import { ListPaymentsUseCase } from '../application/use-cases/payment/list-payments.use-case';
import { UpdatePaymentUseCase } from '../application/use-cases/payment/update-payment.use-case';
import { PaymentTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/payment.repository';
import { CaseRecordModule } from './case-record.module';
import { ContractModule } from './contract.module';
import { DocumentModule } from './document.module';
import { PaymentController } from './controllers/payment.controller';
import { PaymentPlanModule } from './payment-plan.module';

@Module({
  imports: [CaseRecordModule, ContractModule, PaymentPlanModule, DocumentModule],
  controllers: [PaymentController],
  providers: [
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PaymentTypeOrmRepository,
    },
    CreatePaymentUseCase,
    UpdatePaymentUseCase,
    DeletePaymentUseCase,
    GetPaymentByIdUseCase,
    ListPaymentsUseCase,
    ListPaymentsByContractUseCase,
  ],
  exports: [PAYMENT_REPOSITORY],
})
export class PaymentModule {}
