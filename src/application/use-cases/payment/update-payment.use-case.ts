import { Inject, Injectable } from '@nestjs/common';
import { Payment } from '../../../domain/entities/payment.entity';
import { IDocumentRepository } from '../../../domain/repositories/document.repository';
import {
  IPaymentRepository,
  PaymentWithRelations,
} from '../../../domain/repositories/payment.repository';
import { UpdatePaymentDto } from '../../dto/payment/update-payment.dto';
import { DOCUMENT_REPOSITORY } from '../../tokens/document.repository.token';
import { PAYMENT_REPOSITORY } from '../../tokens/payment.repository.token';

@Injectable()
export class UpdatePaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: IDocumentRepository,
  ) {}

  async execute(
    idPayment: number,
    dto: UpdatePaymentDto,
  ): Promise<PaymentWithRelations> {
    const existing = await this.paymentRepository.findByIdWithRelations(
      idPayment,
    );
    if (!existing) {
      throw new Error('PAYMENT_NOT_FOUND');
    }

    const nextDocumentId =
      dto.idDocument !== undefined ? dto.idDocument : existing.idDocument;

    if (dto.idDocument !== undefined) {
      const document = await this.documentRepository.findById(dto.idDocument);
      if (!document) {
        throw new Error('DOCUMENT_NOT_FOUND');
      }
    }

    if (existing.idContract != null && nextDocumentId != null) {
      const duplicate =
        await this.paymentRepository.findByContractPaymentPlanAndDocument(
          existing.idContract,
          existing.idPaymentPlan,
          nextDocumentId,
        );
      if (duplicate && duplicate.idPayment !== idPayment) {
        throw new Error('PAYMENT_DUPLICATE');
      }
    }

    const entity = new Payment(
      idPayment,
      existing.idPaymentPlan,
      existing.idContract,
      nextDocumentId,
      dto.paymentDate ?? existing.paymentDate,
      dto.amount !== undefined ? dto.amount : existing.amount,
      dto.numberInstallments !== undefined
        ? dto.numberInstallments
        : existing.numberInstallments,
      dto.paymentDescription !== undefined
        ? dto.paymentDescription
        : existing.paymentDescription,
    );

    await this.paymentRepository.update(entity);

    const updated = await this.paymentRepository.findByIdWithRelations(
      idPayment,
    );
    if (!updated) {
      throw new Error('PAYMENT_NOT_FOUND');
    }
    return updated;
  }
}
