import {Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query, UseGuards} from '@nestjs/common';
import { CreateCaseRecordDto } from '../../application/dto/case-record/create-case-record.dto';
import { QueryCaseRecordDto } from '../../application/dto/case-record/query-case-record.dto';
import { UpdateCaseRecordDto } from '../../application/dto/case-record/update-case-record.dto';
import { CreateCaseRecordUseCase } from '../../application/use-cases/case-record/create-case-record.use-case';
import { DeleteCaseRecordUseCase } from '../../application/use-cases/case-record/delete-case-record.use-case';
import { GetCaseRecordByIdUseCase } from '../../application/use-cases/case-record/get-case-record-by-id.use-case';
import { GetOrCreateCurrentCaseUseCase } from '../../application/use-cases/case-record/get-or-create-current-case.use-case';
import { ListCaseRecordsUseCase } from '../../application/use-cases/case-record/list-case-records.use-case';
import { UpdateCaseRecordUseCase } from '../../application/use-cases/case-record/update-case-record.use-case';
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
    private readonly getOrCreateCurrentUseCase: GetOrCreateCurrentCaseUseCase,
    private readonly listUseCase: ListCaseRecordsUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('cliente')
  async create( @Body() dto: CreateCaseRecordDto,@CurrentUser() user: JwtPayload,) {
    try {
      const entity = await this.createUseCase.execute(dto, {
        holder: user.userId,
        codeCompany: user.codeCompany,
      });
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
  @Roles('administrador')
  async delete(@Param('id', ParseIntPipe) idCase: number) {
    try {
      await this.deleteUseCase.execute(idCase);
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
      throw err;
    }
  }

  @Get('current')
  @UseGuards(RolesGuard)
  @Roles('cliente')
  async getCurrent(@CurrentUser() user: JwtPayload) {
    try {
      const entity = await this.getOrCreateCurrentUseCase.execute(
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
        err.message === 'CASE_CODE_GENERATION_FAILED'
      ) {
        throw new ForbiddenException(
          'No se pudo generar un código único. Intente nuevamente.',
        );
      }
      if (
        err instanceof Error &&
        err.message === 'CASE_RECORD_CREATED_BUT_NOT_FOUND'
      ) {
        throw new ForbiddenException(
          'Error al crear el caso. Intente nuevamente.',
        );
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
