import { Inject, Injectable } from '@nestjs/common';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository';
import { PAYMENT_REPOSITORY } from '../../tokens/payment.repository.token';

@Injectable()
export class DeletePaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(idPayment: number): Promise<void> {
    const existing = await this.paymentRepository.findByIdWithRelations(
      idPayment,
    );
    if (!existing) {
      throw new Error('PAYMENT_NOT_FOUND');
    }
    await this.paymentRepository.delete(idPayment);
  }
}
