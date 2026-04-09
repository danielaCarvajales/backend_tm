import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { Payment } from '../../../../domain/entities/payment.entity';
import {
  IPaymentRepository,
  PaymentListQuery,
  PaymentPaginatedResult,
  PaymentWithRelations,
} from '../../../../domain/repositories/payment.repository';
import { Payment as PaymentOrm } from '../entities/payment/payment';
import { DocumentMapper } from '../mappers/document.mapper';
import { PaymentMapper } from '../mappers/payment.mapper';

@Injectable()
export class PaymentTypeOrmRepository implements IPaymentRepository {
  private readonly repository: Repository<PaymentOrm>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(PaymentOrm);
  }

  async save(entity: Payment): Promise<Payment> {
    const orm = PaymentMapper.toOrm(entity);
    const saved = await this.repository.save(orm);
    return PaymentMapper.toDomain(saved);
  }

  async update(entity: Payment): Promise<void> {
    if (entity.idPayment === undefined) {
      throw new Error('No se puede actualizar una entidad sin id');
    }
    await this.repository.update(
      { idPayment: entity.idPayment },
      {
        idPaymentPlan: entity.idPaymentPlan,
        idContract: entity.idContract,
        idDocument: entity.idDocument,
        paymentDate: entity.paymentDate,
        amount: entity.amount,
        numberInstallments: entity.numberInstallments,
        paymentDescription: entity.paymentDescription,
      },
    );
  }

  async delete(idPayment: number): Promise<void> {
    await this.repository.delete({ idPayment });
  }

  async findByIdWithRelations(
    idPayment: number,
  ): Promise<PaymentWithRelations | null> {
    const orm = await this.repository.findOne({
      where: { idPayment },
      relations: [
        'contract',
        'contract.caseRecord',
        'paymentPlan',
        'supportDocument',
        'supportDocument.documentType',
      ],
    });
    return orm ? this.mapToWithRelations(orm) : null;
  }

  async findByContractPaymentPlanAndDocument(
    idContract: number,
    idPaymentPlan: number,
    idDocument: number,
  ): Promise<Payment | null> {
    const orm = await this.repository.findOne({
      where: { idContract, idPaymentPlan, idDocument },
    });
    return orm ? PaymentMapper.toDomain(orm) : null;
  }

  async findPaginated(
    query: PaymentListQuery,
  ): Promise<PaymentPaginatedResult<PaymentWithRelations>> {
    const { page, pageSize, idContract, idPaymentPlan } = query;
    const skip = (page - 1) * pageSize;

    const where: FindOptionsWhere<PaymentOrm> = {};
    if (idContract !== undefined && idContract !== null) {
      where.idContract = idContract;
    }
    if (idPaymentPlan !== undefined && idPaymentPlan !== null) {
      where.idPaymentPlan = idPaymentPlan;
    }

    const [items, totalItems] = await this.repository.findAndCount({
      where,
      relations: [
        'contract',
        'contract.caseRecord',
        'paymentPlan',
        'supportDocument',
        'supportDocument.documentType',
      ],
      order: { idPayment: 'DESC' },
      skip,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((row) => this.mapToWithRelations(row)),
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  private mapToWithRelations(orm: PaymentOrm): PaymentWithRelations {
    return {
      idPayment: orm.idPayment,
      idPaymentPlan: orm.idPaymentPlan,
      idContract: orm.idContract,
      idDocument: orm.idDocument,
      paymentDate: orm.paymentDate,
      amount: Number(orm.amount),
      numberInstallments: orm.numberInstallments,
      paymentDescription: orm.paymentDescription ?? null,
      contract: orm.contract
        ? {
            idContract: orm.contract.idContract,
            contractCode: orm.contract.contractCode,
            idCase: orm.contract.idCase,
            digitalSignature: orm.contract.digitalSignature ?? null,
            createdAt: orm.contract.createdAt,
            caseRecord: orm.contract.caseRecord
              ? {
                  idCase: orm.contract.caseRecord.idCase,
                  caseCode: orm.contract.caseRecord.caseCode,
                }
              : null,
          }
        : null,
      paymentPlan: orm.paymentPlan
        ? {
            idPaymentPlan: orm.paymentPlan.idPaymentPlan,
            name: orm.paymentPlan.name,
            description: orm.paymentPlan.description ?? null,
            dueDays: orm.paymentPlan.dueDays,
          }
        : {
            idPaymentPlan: orm.idPaymentPlan,
            name: '',
            description: null,
            dueDays: 0,
          },
      document: orm.supportDocument
        ? this.mapDocumentView(orm.supportDocument)
        : null,
    };
  }

  private mapDocumentView(
    orm: NonNullable<PaymentOrm['supportDocument']>,
  ): PaymentWithRelations['document'] {
    const d = DocumentMapper.toDomain(orm);
    return {
      idDocument: d.idDocument ?? 0,
      nameFileDocument: d.nameFileDocument,
      descriptionDocument: d.descriptionDocument,
      urlDocument: d.urlDocument,
      mimeType: d.mimeType,
      idTypeDocument: d.idTypeDocument,
      createdAtDocument: d.createdAtDocument,
      typeDocument: d.typeDocument
        ? {
            idTypeDocument: d.typeDocument.idTypeDocument ?? 0,
            nameTypeDocument: d.typeDocument.nameTypeDocument,
          }
        : null,
    };
  }
}
