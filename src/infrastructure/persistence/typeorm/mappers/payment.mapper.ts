import { Payment } from '../../../../domain/entities/payment.entity';
import { Payment as PaymentOrm } from '../entities/payment/payment';

export class PaymentMapper {
  static toDomain(orm: PaymentOrm): Payment {
    return new Payment(
      orm.idPayment,
      orm.idPaymentPlan,
      orm.idContract,
      orm.idDocument,
      orm.paymentDate,
      Number(orm.amount),
      orm.numberInstallments,
      orm.paymentDescription ?? null,
    );
  }

  static toOrm(domain: Payment): PaymentOrm {
    return new PaymentOrm(
      domain.idPayment ?? 0,
      domain.idPaymentPlan,
      domain.idContract,
      domain.idDocument,
      domain.paymentDate,
      domain.amount,
      domain.numberInstallments,
      domain.paymentDescription,
    );
  }
}
