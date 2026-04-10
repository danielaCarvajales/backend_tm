import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateCaseRecordDto } from '../../application/dto/case-record/create-case-record.dto';
import { QueryCaseRecordDto } from '../../application/dto/case-record/query-case-record.dto';
import { UpdateCaseRecordDto } from '../../application/dto/case-record/update-case-record.dto';
import {
  AuthContext,
  ensureCanManageCompanyUsers,
} from '../../application/auth/auth-context';
import { CreateCaseRecordUseCase } from '../../application/use-cases/case-record/create-case-record.use-case';
import { DeleteCaseRecordUseCase } from '../../application/use-cases/case-record/delete-case-record.use-case';
import { GetCaseRecordByIdUseCase } from '../../application/use-cases/case-record/get-case-record-by-id.use-case';
import { GetCurrentCaseUseCase } from '../../application/use-cases/case-record/get-current-case.use-case';
import { ListCaseRecordsUseCase } from '../../application/use-cases/case-record/list-case-records.use-case';
import { UpdateCaseRecordUseCase } from '../../application/use-cases/case-record/update-case-record.use-case';
import { AuthContextUser } from '../../infrastructure/auth/decorators/auth-context.decorator';
import { CurrentUser } from '../../infrastructure/auth/decorators/current-user.decorator';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator';
import { JwtPayload } from '../../infrastructure/auth/strategies/jwt.strategy';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';

@Controller('case-records')
export class CaseRecordController {
  constructor(
    private readonly createUseCase: CreateCaseRecordUseCase,
    private readonly updateUseCase: UpdateCaseRecordUseCase,
    private readonly deleteUseCase: DeleteCaseRecordUseCase,
    private readonly getByIdUseCase: GetCaseRecordByIdUseCase,
    private readonly getCurrentUseCase: GetCurrentCaseUseCase,
    private readonly listUseCase: ListCaseRecordsUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('administrador', 'asesor')
  async create(
    @Body() dto: CreateCaseRecordDto,
    @AuthContextUser() ctx: AuthContext,
  ) {
    try {
      ensureCanManageCompanyUsers(ctx);
      const entity = await this.createUseCase.execute(
        { amount: dto.amount, serviceIds: dto.serviceIds ?? null },
        {
          holder: dto.holderPersonId,
          codeCompany: ctx.companyId,
          agentPersonId: ctx.userId,
        },
      );
      return {
        data: entity,
        message: 'Caso creado exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'CASE_CODE_GENERATION_FAILED'
      ) {
        throw new ForbiddenException(
          'No se pudo generar un código único. Intente nuevamente.',
        );
      }
      if (err instanceof Error && err.message === 'PERSON_NOT_FOUND') {
        throw new NotFoundException('Titular no encontrado en la compañía');
      }
      if (
        err instanceof Error &&
        err.message === 'CASE_ALREADY_EXISTS_FOR_HOLDER'
      ) {
        throw new ForbiddenException(
          'El titular ya tiene un caso en esta compañía',
        );
      }
      if (
        err instanceof Error &&
        err.message === 'SERVICE_COMPANY_NOT_FOUND'
      ) {
        throw new NotFoundException(
          'Uno o más servicios no existen en la compañía',
        );
      }
      throw err;
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) idCase: number,
    @Body() dto: UpdateCaseRecordDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const role = this.mapRoleForUpdate(user.role);
    try {
      const entity = await this.updateUseCase.execute(
        idCase,
        dto,
        role,
        user.userId,
      );
      return {
        data: entity,
        message: 'Caso actualizado exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'CASE_RECORD_NOT_FOUND'
      ) {
        throw new NotFoundException('Caso no encontrado');
      }
      throw err;
    }
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador', 'asesor')
  async delete(
    @Param('id', ParseIntPipe) idCase: number,
    @AuthContextUser() ctx: AuthContext,
  ) {
    try {
      await this.deleteUseCase.execute(idCase, ctx);
      return {
        message: 'Caso eliminado exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'CASE_RECORD_NOT_FOUND'
      ) {
        throw new NotFoundException('Caso no encontrado');
      }
      if (
        err instanceof Error &&
        err.message === 'FORBIDDEN_COMPANY_SCOPE'
      ) {
        throw new ForbiddenException('No puede eliminar casos de otra compañía');
      }
      if (
        err instanceof Error &&
        err.message === 'FORBIDDEN_ROLE_SCOPE'
      ) {
        throw new ForbiddenException('No tiene permisos para eliminar casos');
      }
      throw err;
    }
  }

  @Get('current')
  @UseGuards(RolesGuard)
  @Roles('cliente')
  async getCurrent(@CurrentUser() user: JwtPayload) {
    try {
      const entity = await this.getCurrentUseCase.execute(
        user.userId,
        user.codeCompany,
      );
      return {
        data: entity,
        message: 'Caso obtenido exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'CASE_RECORD_NOT_FOUND'
      ) {
        throw new NotFoundException('No tiene un caso asignado');
      }
      throw err;
    }
  }

  @Get()
  async list(
    @Query() query: QueryCaseRecordDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.listUseCase.execute(
      query,
      user.userId,
      user.role,
      user.codeCompany,
    );
    return {
      message: 'Casos obtenidos exitosamente',
      data: result.data,
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
  async getById(
    @Param('id', ParseIntPipe) idCase: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const entity = await this.getByIdUseCase.execute(
      idCase,
      user.userId,
      user.role,
      user.codeCompany,
    );
    if (!entity) {
      throw new NotFoundException('Caso no encontrado');
    }
    return {
      data: entity,
      message: 'Caso encontrado exitosamente',
    };
  }

  private mapRoleForUpdate(role: string): 'Cliente' | 'Asesor' | 'Administrador' {
    const r = role?.toLowerCase() ?? '';
    if (r === 'administrador') return 'Administrador';
    if (r === 'asesor') return 'Asesor';
    return 'Cliente';
  }
}
