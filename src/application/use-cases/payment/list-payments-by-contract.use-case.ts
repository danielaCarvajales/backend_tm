import { Inject, Injectable } from '@nestjs/common';
import {
  IPaymentRepository,
  PaymentListQuery,
  PaymentPaginatedResult,
  PaymentWithRelations,
} from '../../../domain/repositories/payment.repository';
import { QueryPaymentDto } from '../../dto/payment/query-payment.dto';
import { PAYMENT_REPOSITORY } from '../../tokens/payment.repository.token';

@Injectable()
export class ListPaymentsByContractUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(
    idContract: number,
    query: Pick<QueryPaymentDto, 'page' | 'pageSize'>,
  ): Promise<PaymentPaginatedResult<PaymentWithRelations>> {
    const domainQuery: PaymentListQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      idContract,
    };
    return this.paymentRepository.findPaginated(domainQuery);
  }
}
