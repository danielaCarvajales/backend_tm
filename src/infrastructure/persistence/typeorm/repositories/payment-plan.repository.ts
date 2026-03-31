import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PaymentPlan } from '../../../../domain/entities/payment-plan.entity';
import {
  IPaymentPlanRepository,
  PaginatedResult,
  PaymentPlanListQuery,
} from '../../../../domain/repositories/payment-plan.repository';
import { Payment as PaymentOrm } from '../entities/payment/payment';
import { PaymentPlan as PaymentPlanOrm } from '../entities/payment-plan/payment-plan';
import { PaymentPlanMapper } from '../mappers/payment-plan.mapper';

@Injectable()
export class PaymentPlanTypeOrmRepository implements IPaymentPlanRepository {
  private readonly repository: Repository<PaymentPlanOrm>;
  private readonly paymentRepository: Repository<PaymentOrm>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(PaymentPlanOrm);
    this.paymentRepository = this.dataSource.getRepository(PaymentOrm);
  }

  // Saves a new PaymentPlan entity.
  async save(entity: PaymentPlan): Promise<PaymentPlan> {
    const orm = PaymentPlanMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return PaymentPlanMapper.toDomain(saved);
  }

  // Updates an existing PaymentPlan entity.
  async update(entity: PaymentPlan): Promise<PaymentPlan> {
    const orm = PaymentPlanMapper.toOrm(entity);
    const updated = await this.repository.save(orm);
    return PaymentPlanMapper.toDomain(updated);
  }

  // Deletes PaymentPlan entity.
  async delete(idPaymentPlan: number): Promise<void> {
    await this.repository.delete(idPaymentPlan);
  }

  // Finds a PaymentPlan entity by its ID.
  async findById(idPaymentPlan: number): Promise<PaymentPlan | null> {
    const orm = await this.repository.findOne({
      where: { idPaymentPlan },
    });
    return orm ? PaymentPlanMapper.toDomain(orm) : null;
  }

  // Finds paginated PaymentPlan entities.
  async findPaginated(
    query: PaymentPlanListQuery,
  ): Promise<PaginatedResult<PaymentPlan>> {
    const { page, pageSize, search } = query;
    const skip = (page - 1) * pageSize;

    const qb = this.repository
      .createQueryBuilder('pp')
      .select([
        'pp.idPaymentPlan',
        'pp.name',
        'pp.description',
        'pp.dueDays',
      ]);

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      qb.andWhere(
        '(pp.name LIKE :term OR pp.description LIKE :term)',
        { term },
      );
    }

    const [items, totalItems] = await qb
      .orderBy('pp.name', 'ASC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((orm) => PaymentPlanMapper.toDomain(orm)),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async countPaymentsByPaymentPlanId(
    idPaymentPlan: number,
  ): Promise<number> {
    return this.paymentRepository.count({
      where: { idPaymentPlan },
    });
  }
}
