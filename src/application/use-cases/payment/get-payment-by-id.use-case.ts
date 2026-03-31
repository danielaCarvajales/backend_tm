import { Inject, Injectable } from '@nestjs/common';
import {
  IPaymentRepository,
  PaymentWithRelations,
} from '../../../domain/repositories/payment.repository';
import { PAYMENT_REPOSITORY } from '../../tokens/payment.repository.token';

@Injectable()
export class GetPaymentByIdUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(idPayment: number): Promise<PaymentWithRelations | null> {
    return this.paymentRepository.findByIdWithRelations(idPayment);
  }
}
