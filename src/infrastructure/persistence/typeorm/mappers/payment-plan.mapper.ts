import { PaymentPlan } from '../../../../domain/entities/payment-plan.entity';
import { PaymentPlan as PaymentPlanOrm } from '../entities/payment-plan/payment-plan';

export class PaymentPlanMapper {
  // Maps ORM entity to domain entity.
  static toDomain(orm: PaymentPlanOrm): PaymentPlan {
    return new PaymentPlan(
      orm.idPaymentPlan,
      orm.name,
      orm.description ?? null,
      orm.dueDays,
    );
  }

  // Maps domain entity to ORM entity (for save/update).
  static toOrm(domain: PaymentPlan): PaymentPlanOrm {
    const orm = new PaymentPlanOrm(
      domain.name,
      domain.description,
      domain.dueDays,
    );
    if (domain.idPaymentPlan !== undefined) {
      orm.idPaymentPlan = domain.idPaymentPlan;
    }
    return orm;
  }
}
