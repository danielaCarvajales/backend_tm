import { Payment } from '../entities/payment.entity';

export interface PaymentDocumentView {
  idDocument: number;
  nameFileDocument: string;
  descriptionDocument: string | null;
  urlDocument: string;
  mimeType: string;
  idTypeDocument: number | null;
  createdAtDocument: Date;
  typeDocument: {
    idTypeDocument: number;
    nameTypeDocument: string;
  } | null;
}

export interface PaymentWithRelations {
  idPayment: number;
  idPaymentPlan: number;
  idContract: number | null;
  idDocument: number | null;
  paymentDate: Date;
  amount: number;
  numberInstallments: number | null;
  paymentDescription: string | null;
  contract: {
    idContract: number;
    contractCode: string;
    idCase: number;
    digitalSignature: string | null;
    createdAt: Date;
    caseRecord: {
      idCase: number;
      caseCode: string;
    } | null;
  } | null;
  paymentPlan: {
    idPaymentPlan: number;
    name: string;
    description: string | null;
    dueDays: number;
  };
  document: PaymentDocumentView | null;
}

export interface PaymentListQuery {
  page: number;
  pageSize: number;
  idContract?: number;
  idPaymentPlan?: number;
}

export interface PaymentPaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IPaymentRepository {
  save(entity: Payment): Promise<Payment>;
  update(entity: Payment): Promise<void>;
  delete(idPayment: number): Promise<void>;
  findByIdWithRelations(
    idPayment: number,
  ): Promise<PaymentWithRelations | null>;
  findByContractPaymentPlanAndDocument(
    idContract: number,
    idPaymentPlan: number,
    idDocument: number,
  ): Promise<Payment | null>;
  findPaginated(
    query: PaymentListQuery,
  ): Promise<PaymentPaginatedResult<PaymentWithRelations>>;
}
