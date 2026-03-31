import { PaymentPlan } from '../entities/payment-plan.entity';

// Paginated result structure for list operations.
export interface PaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Query criteria for paginated listing
export interface PaymentPlanListQuery {
  page: number;
  pageSize: number;
  search?: string;
}

// PaymentPlan Repository
export interface IPaymentPlanRepository {
  save(entity: PaymentPlan): Promise<PaymentPlan>;
  update(entity: PaymentPlan): Promise<PaymentPlan>;
  delete(idPaymentPlan: number): Promise<void>;
  findById(idPaymentPlan: number): Promise<PaymentPlan | null>;
  findPaginated(
    query: PaymentPlanListQuery,
  ): Promise<PaginatedResult<PaymentPlan>>;
  countPaymentsByPaymentPlanId(idPaymentPlan: number): Promise<number>;
}
