import { CreatePaymentDto } from '../../../dto/payment/create-payment.dto';
import { Contract } from '../../../../domain/entities/contract.entity';
import { Document } from '../../../../domain/entities/document.entity';
import { Payment } from '../../../../domain/entities/payment.entity';
import { PaymentPlan } from '../../../../domain/entities/payment-plan.entity';
import { IContractRepository } from '../../../../domain/repositories/contract.repository';
import { IDocumentRepository } from '../../../../domain/repositories/document.repository';
import {
  IPaymentRepository,
  PaymentWithRelations,
} from '../../../../domain/repositories/payment.repository';
import { IPaymentPlanRepository } from '../../../../domain/repositories/payment-plan.repository';
import { CreatePaymentUseCase } from '../create-payment.use-case';

function dto(overrides: Partial<CreatePaymentDto> = {}): CreatePaymentDto {
  return {
    idContract: 1,
    idPaymentPlan: 2,
    idDocument: 3,
    paymentDate: new Date('2025-06-01'),
    amount: 100.5,
    numberInstallments: 12,
    paymentDescription: 'Cuota',
    ...overrides,
  };
}

function minimalPaymentWithRelations(idPayment: number): PaymentWithRelations {
  return {
    idPayment,
    idPaymentPlan: 2,
    idContract: 1,
    idDocument: 3,
    paymentDate: new Date(),
    amount: 100.5,
    numberInstallments: 12,
    paymentDescription: 'Cuota',
    contract: null,
    paymentPlan: {
      idPaymentPlan: 2,
      name: 'Plan',
      description: null,
      dueDays: 30,
    },
    document: null,
  };
}

describe('CreatePaymentUseCase', () => {
  let useCase: CreatePaymentUseCase;
  let paymentRepo: jest.Mocked<IPaymentRepository>;
  let contractRepo: jest.Mocked<IContractRepository>;
  let paymentPlanRepo: jest.Mocked<IPaymentPlanRepository>;
  let documentRepo: jest.Mocked<IDocumentRepository>;

  beforeEach(() => {
    paymentRepo = {
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByIdWithRelations: jest.fn(),
      findByContractPaymentPlanAndDocument: jest.fn(),
      findPaginated: jest.fn(),
    };
    contractRepo = {
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByIdWithRelations: jest.fn(),
      findByContractCode: jest.fn(),
      findPaginated: jest.fn(),
    };
    paymentPlanRepo = {
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findPaginated: jest.fn(),
      countPaymentsByPaymentPlanId: jest.fn(),
    };
    documentRepo = {
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findPaginated: jest.fn(),
    };
    useCase = new CreatePaymentUseCase(
      paymentRepo,
      contractRepo,
      paymentPlanRepo,
      documentRepo,
    );
  });

  it('lanza CONTRACT_NOT_FOUND si el contrato no existe', async () => {
    contractRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(dto())).rejects.toThrow('CONTRACT_NOT_FOUND');
    expect(paymentPlanRepo.findById).not.toHaveBeenCalled();
  });

  it('lanza PAYMENT_PLAN_NOT_FOUND si el plan no existe', async () => {
    contractRepo.findById.mockResolvedValue(
      new Contract(1, 'C-1', 10, null, new Date()),
    );
    paymentPlanRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(dto())).rejects.toThrow(
      'PAYMENT_PLAN_NOT_FOUND',
    );
    expect(documentRepo.findById).not.toHaveBeenCalled();
  });

  it('lanza DOCUMENT_NOT_FOUND si el documento no existe', async () => {
    contractRepo.findById.mockResolvedValue(
      new Contract(1, 'C-1', 10, null, new Date()),
    );
    paymentPlanRepo.findById.mockResolvedValue(
      new PaymentPlan(2, 'Plan', null, 30),
    );
    documentRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(dto())).rejects.toThrow('DOCUMENT_NOT_FOUND');
    expect(paymentRepo.findByContractPaymentPlanAndDocument).not.toHaveBeenCalled();
  });

  it('lanza PAYMENT_DUPLICATE si ya existe la misma terna contrato/plan/documento', async () => {
    contractRepo.findById.mockResolvedValue(
      new Contract(1, 'C-1', 10, null, new Date()),
    );
    paymentPlanRepo.findById.mockResolvedValue(
      new PaymentPlan(2, 'Plan', null, 30),
    );
    documentRepo.findById.mockResolvedValue(
      new Document(3, 'f.pdf', null, '/u', 'application/pdf', null, new Date()),
    );
    paymentRepo.findByContractPaymentPlanAndDocument.mockResolvedValue(
      new Payment(99, 2, 1, 3, new Date(), 50, 1, null),
    );

    await expect(useCase.execute(dto())).rejects.toThrow('PAYMENT_DUPLICATE');
    expect(paymentRepo.save).not.toHaveBeenCalled();
  });

  it('persiste y devuelve el pago con relaciones', async () => {
    const input = dto();
    contractRepo.findById.mockResolvedValue(
      new Contract(1, 'C-1', 10, null, new Date()),
    );
    paymentPlanRepo.findById.mockResolvedValue(
      new PaymentPlan(2, 'Plan', null, 30),
    );
    documentRepo.findById.mockResolvedValue(
      new Document(3, 'f.pdf', null, '/u', 'application/pdf', null, new Date()),
    );
    paymentRepo.findByContractPaymentPlanAndDocument.mockResolvedValue(null);
    paymentRepo.save.mockResolvedValue(
      new Payment(
        500,
        input.idPaymentPlan,
        input.idContract,
        input.idDocument,
        input.paymentDate,
        input.amount,
        input.numberInstallments,
        input.paymentDescription ?? null,
      ),
    );
    const withRelations = minimalPaymentWithRelations(500);
    paymentRepo.findByIdWithRelations.mockResolvedValue(withRelations);

    const result = await useCase.execute(input);

    expect(result).toBe(withRelations);
    expect(paymentRepo.save).toHaveBeenCalledTimes(1);
    const savedEntity = paymentRepo.save.mock.calls[0][0] as Payment;
    expect(savedEntity.idPayment).toBeUndefined();
    expect(savedEntity.idContract).toBe(input.idContract);
    expect(paymentRepo.findByIdWithRelations).toHaveBeenCalledWith(500);
  });

  it('lanza PAYMENT_NOT_FOUND si tras guardar no se obtienen relaciones', async () => {
    contractRepo.findById.mockResolvedValue(
      new Contract(1, 'C-1', 10, null, new Date()),
    );
    paymentPlanRepo.findById.mockResolvedValue(
      new PaymentPlan(2, 'Plan', null, 30),
    );
    documentRepo.findById.mockResolvedValue(
      new Document(3, 'f.pdf', null, '/u', 'application/pdf', null, new Date()),
    );
    paymentRepo.findByContractPaymentPlanAndDocument.mockResolvedValue(null);
    paymentRepo.save.mockResolvedValue(
      new Payment(500, 2, 1, 3, new Date(), 100, 12, null),
    );
    paymentRepo.findByIdWithRelations.mockResolvedValue(null);

    await expect(useCase.execute(dto())).rejects.toThrow('PAYMENT_NOT_FOUND');
  });
});
