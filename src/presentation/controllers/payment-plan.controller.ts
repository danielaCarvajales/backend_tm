import {Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards} from '@nestjs/common';
import { CreatePaymentPlanDto } from '../../application/dto/payment-plan/create-payment-plan.dto';
import { QueryPaymentPlanDto } from '../../application/dto/payment-plan/query-payment-plan.dto';
import { UpdatePaymentPlanDto } from '../../application/dto/payment-plan/update-payment-plan.dto';
import { CreatePaymentPlanUseCase } from '../../application/use-cases/payment-plan/create-payment-plan.use-case';
import { DeletePaymentPlanUseCase } from '../../application/use-cases/payment-plan/delete-payment-plan.use-case';
import { GetPaymentPlanByIdUseCase } from '../../application/use-cases/payment-plan/get-payment-plan-by-id.use-case';
import { ListPaymentPlansUseCase } from '../../application/use-cases/payment-plan/list-payment-plans.use-case';
import { UpdatePaymentPlanUseCase } from '../../application/use-cases/payment-plan/update-payment-plan.use-case';
import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Roles } from 'src/infrastructure/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/infrastructure/auth/guards/roles.guard';

@Controller('payment-plans')
export class PaymentPlanController {
  constructor(
    private readonly createUseCase: CreatePaymentPlanUseCase,
    private readonly updateUseCase: UpdatePaymentPlanUseCase,
    private readonly deleteUseCase: DeletePaymentPlanUseCase,
    private readonly getByIdUseCase: GetPaymentPlanByIdUseCase,
    private readonly listUseCase: ListPaymentPlansUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('administrador', 'asesor')
  async create(@Body() dto: CreatePaymentPlanDto) {
    const entity = await this.createUseCase.execute(dto);
    return {
      data: {
        idPaymentPlan: entity.idPaymentPlan,
        name: entity.name,
        description: entity.description,
        dueDays: entity.dueDays,
      },
      message: 'Plan de pago creado exitosamente',
    };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador', 'asesor')
  async update(
    @Param('id', ParseIntPipe) idPaymentPlan: number,
    @Body() dto: UpdatePaymentPlanDto,
  ) {
    try {
      const entity = await this.updateUseCase.execute(idPaymentPlan, dto);
      return {
        data: {
          idPaymentPlan: entity.idPaymentPlan,
          name: entity.name,
          description: entity.description,
          dueDays: entity.dueDays,
        },
        message: 'Plan de pago actualizado exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'PAYMENT_PLAN_NOT_FOUND'
      ) {
        throw new NotFoundException('Plan de pago no encontrado');
      }
      throw err;
    }
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador', 'asesor')
  async delete(@Param('id', ParseIntPipe) idPaymentPlan: number) {
    try {
      await this.deleteUseCase.execute(idPaymentPlan);
      return {
        message: 'Plan de pago eliminado exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'PAYMENT_PLAN_NOT_FOUND'
      ) {
        throw new NotFoundException('Plan de pago no encontrado');
      }
      if (
        err instanceof Error &&
        err.message === 'PAYMENT_PLAN_IN_USE'
      ) {
        throw new ConflictException(
          'No se puede eliminar: el plan de pago está asociado a uno o más pagos',
        );
      }
      throw err;
    }
  }

  @Get()
  async list(@Query() query: QueryPaymentPlanDto) {
    const result = await this.listUseCase.execute(query);
    return {
      message: 'Planes de pago obtenidos exitosamente',
      data: result.data.map((entity) => ({
        idPaymentPlan: entity.idPaymentPlan,
        name: entity.name,
        description: entity.description,
        dueDays: entity.dueDays,
      })),
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
  async getById(@Param('id', ParseIntPipe) idPaymentPlan: number) {
    const entity = await this.getByIdUseCase.execute(idPaymentPlan);
    if (!entity) {
      throw new NotFoundException('Plan de pago no encontrado');
    }
    return {
      data: {
        idPaymentPlan: entity.idPaymentPlan,
        name: entity.name,
        description: entity.description,
        dueDays: entity.dueDays,
      },
      message: 'Plan de pago encontrado exitosamente',
    };
  }
}
