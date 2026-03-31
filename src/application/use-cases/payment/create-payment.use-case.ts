import { Inject, Injectable } from '@nestjs/common';
import { Payment } from '../../../domain/entities/payment.entity';
import { IContractRepository } from '../../../domain/repositories/contract.repository';
import { IDocumentRepository } from '../../../domain/repositories/document.repository';
import {
  IPaymentRepository,
  PaymentWithRelations,
} from '../../../domain/repositories/payment.repository';
import { IPaymentPlanRepository } from '../../../domain/repositories/payment-plan.repository';
import { CreatePaymentDto } from '../../dto/payment/create-payment.dto';
import { CONTRACT_REPOSITORY } from '../../tokens/contract.repository.token';
import { DOCUMENT_REPOSITORY } from '../../tokens/document.repository.token';
import { PAYMENT_REPOSITORY } from '../../tokens/payment.repository.token';
import { PAYMENT_PLAN_REPOSITORY } from '../../tokens/payment-plan.repository.token';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(CONTRACT_REPOSITORY)
    private readonly contractRepository: IContractRepository,
    @Inject(PAYMENT_PLAN_REPOSITORY)
    private readonly paymentPlanRepository: IPaymentPlanRepository,
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: IDocumentRepository,
  ) {}

  async execute(dto: CreatePaymentDto): Promise<PaymentWithRelations> {
    const contract = await this.contractRepository.findById(dto.idContract);
    if (!contract) {
      throw new Error('CONTRACT_NOT_FOUND');
    }

    const paymentPlan = await this.paymentPlanRepository.findById(
      dto.idPaymentPlan,
    );
    if (!paymentPlan) {
      throw new Error('PAYMENT_PLAN_NOT_FOUND');
    }

    const document = await this.documentRepository.findById(dto.idDocument);
    if (!document) {
      throw new Error('DOCUMENT_NOT_FOUND');
    }

    const duplicate =
      await this.paymentRepository.findByContractPaymentPlanAndDocument(
        dto.idContract,
        dto.idPaymentPlan,
        dto.idDocument,
      );
    if (duplicate) {
      throw new Error('PAYMENT_DUPLICATE');
    }

    const entity = new Payment(
      undefined,
      dto.idPaymentPlan,
      dto.idContract,
      dto.idDocument,
      dto.paymentDate,
      dto.amount,
      dto.numberInstallments,
      dto.paymentDescription ?? null,
    );
    const saved = await this.paymentRepository.save(entity);

    const withRelations = await this.paymentRepository.findByIdWithRelations(
      saved.idPayment!,
    );
    if (!withRelations) {
      throw new Error('PAYMENT_NOT_FOUND');
    }
    return withRelations;
  }
}
