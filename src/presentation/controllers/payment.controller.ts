import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreatePaymentDto } from '../../application/dto/payment/create-payment.dto';
import { QueryPaymentDto } from '../../application/dto/payment/query-payment.dto';
import { UpdatePaymentDto } from '../../application/dto/payment/update-payment.dto';
import { GetCaseRecordByIdUseCase } from '../../application/use-cases/case-record/get-case-record-by-id.use-case';
import { GetContractByIdUseCase } from '../../application/use-cases/contract/get-contract-by-id.use-case';
import { CreatePaymentUseCase } from '../../application/use-cases/payment/create-payment.use-case';
import { DeletePaymentUseCase } from '../../application/use-cases/payment/delete-payment.use-case';
import { GetPaymentByIdUseCase } from '../../application/use-cases/payment/get-payment-by-id.use-case';
import { ListPaymentsByContractUseCase } from '../../application/use-cases/payment/list-payments-by-contract.use-case';
import { ListPaymentsUseCase } from '../../application/use-cases/payment/list-payments.use-case';
import { UpdatePaymentUseCase } from '../../application/use-cases/payment/update-payment.use-case';
import { PaymentWithRelations } from '../../domain/repositories/payment.repository';
import { CurrentUser } from '../../infrastructure/auth/decorators/current-user.decorator';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';
import { JwtPayload } from '../../infrastructure/auth/strategies/jwt.strategy';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly createUseCase: CreatePaymentUseCase,
    private readonly updateUseCase: UpdatePaymentUseCase,
    private readonly deleteUseCase: DeletePaymentUseCase,
    private readonly getByIdUseCase: GetPaymentByIdUseCase,
    private readonly listUseCase: ListPaymentsUseCase,
    private readonly listByContractUseCase: ListPaymentsByContractUseCase,
    private readonly getContractByIdUseCase: GetContractByIdUseCase,
    private readonly getCaseRecordByIdUseCase: GetCaseRecordByIdUseCase,
  ) {}

  private async verifyCaseAccessForPayment(
    idCase: number,
    user: JwtPayload,
  ): Promise<void> {
    const caseRecord = await this.getCaseRecordByIdUseCase.execute(
      idCase,
      user.userId,
      user.role,
    );
    if (!caseRecord) {
      throw new NotFoundException('Caso no encontrado');
    }
  }

  @Post()
  async create(@Body() dto: CreatePaymentDto) {
    try {
      const data = await this.createUseCase.execute(dto);
      return {
        data: this.toResponse(data),
        message: 'Pago registrado exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'CONTRACT_NOT_FOUND') {
        throw new NotFoundException('Contrato no encontrado');
      }
      if (err instanceof Error && err.message === 'PAYMENT_PLAN_NOT_FOUND') {
        throw new NotFoundException('Plan de pago no encontrado');
      }
      if (err instanceof Error && err.message === 'DOCUMENT_NOT_FOUND') {
        throw new NotFoundException('Documento de soporte no encontrado');
      }
      if (err instanceof Error && err.message === 'PAYMENT_DUPLICATE') {
        throw new ConflictException(
          'Ya existe un pago con el mismo contrato, plan de pago y documento de soporte',
        );
      }
      throw err;
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) idPayment: number,
    @Body() dto: UpdatePaymentDto,
  ) {
    try {
      const data = await this.updateUseCase.execute(idPayment, dto);
      return {
        data: this.toResponse(data),
        message: 'Pago actualizado exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'PAYMENT_NOT_FOUND') {
        throw new NotFoundException('Pago no encontrado');
      }
      if (err instanceof Error && err.message === 'DOCUMENT_NOT_FOUND') {
        throw new NotFoundException('Documento de soporte no encontrado');
      }
      if (err instanceof Error && err.message === 'PAYMENT_DUPLICATE') {
        throw new ConflictException(
          'Ya existe un pago con el mismo contrato, plan de pago y documento de soporte',
        );
      }
      throw err;
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) idPayment: number) {
    try {
      await this.deleteUseCase.execute(idPayment);
      return {
        message: 'Pago eliminado exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'PAYMENT_NOT_FOUND') {
        throw new NotFoundException('Pago no encontrado');
      }
      throw err;
    }
  }

  @Get()
  async list(@Query() query: QueryPaymentDto) {
    const result = await this.listUseCase.execute(query);
    return {
      message: 'Pagos obtenidos exitosamente',
      data: result.data.map((entity) => this.toResponse(entity)),
      pagination: {
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        pageSize: result.pageSize,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
    };
  }

  @Get('by-contract/:idContract')
  @UseGuards(RolesGuard)
  @Roles('administrador', 'asesor', 'cliente')
  async listByContract(
    @Param('idContract', ParseIntPipe) idContract: number,
    @Query() query: QueryPaymentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const contract = await this.getContractByIdUseCase.execute(idContract);
    if (!contract) {
      throw new NotFoundException('Contrato no encontrado');
    }
    await this.verifyCaseAccessForPayment(contract.idCase, user);
    const result = await this.listByContractUseCase.execute(idContract, {
      page: query.page,
      pageSize: query.pageSize,
    });
    return {
      message: 'Pagos del contrato obtenidos exitosamente',
      data: result.data.map((entity) => this.toResponse(entity)),
      pagination: {
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        pageSize: result.pageSize,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
    };
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) idPayment: number) {
    const entity = await this.getByIdUseCase.execute(idPayment);
    if (!entity) {
      throw new NotFoundException('Pago no encontrado');
    }
    return {
      data: this.toResponse(entity),
      message: 'Pago encontrado exitosamente',
    };
  }

  private toResponse(entity: PaymentWithRelations) {
    return {
      idPayment: entity.idPayment,
      idPaymentPlan: entity.idPaymentPlan,
      idContract: entity.idContract,
      idDocument: entity.idDocument,
      paymentDate: entity.paymentDate,
      amount: entity.amount,
      numberInstallments: entity.numberInstallments,
      paymentDescription: entity.paymentDescription,
      contract: entity.contract,
      paymentPlan: entity.paymentPlan,
      document: entity.document,
    };
  }
}
