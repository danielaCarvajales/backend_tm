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
import { CreateServiceCasesDto } from '../../application/dto/service-cases/create-service-cases.dto';
import { QueryServiceCasesDto } from '../../application/dto/service-cases/query-service-cases.dto';
import { UpdateServiceCasesDto } from '../../application/dto/service-cases/update-service-cases.dto';
import { CreateServiceCasesUseCase } from '../../application/use-cases/service-cases/create-service-cases.use-case';
import { DeleteServiceCasesUseCase } from '../../application/use-cases/service-cases/delete-service-cases.use-case';
import { GetServiceCasesByIdUseCase } from '../../application/use-cases/service-cases/get-service-cases-by-id.use-case';
import { ListServiceCasesUseCase } from '../../application/use-cases/service-cases/list-service-cases.use-case';
import { UpdateServiceCasesUseCase } from '../../application/use-cases/service-cases/update-service-cases.use-case';
import { GetCurrentCaseUseCase } from '../../application/use-cases/case-record/get-current-case.use-case';
import { CurrentUser } from '../../infrastructure/auth/decorators/current-user.decorator';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator';
import { JwtPayload } from '../../infrastructure/auth/strategies/jwt.strategy';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';

@Controller('case-services')
export class ServiceCasesController {
  constructor(
    private readonly createUseCase: CreateServiceCasesUseCase,
    private readonly updateUseCase: UpdateServiceCasesUseCase,
    private readonly deleteUseCase: DeleteServiceCasesUseCase,
    private readonly getByIdUseCase: GetServiceCasesByIdUseCase,
    private readonly listUseCase: ListServiceCasesUseCase,
    private readonly getCurrentCaseUseCase: GetCurrentCaseUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('administrador', 'asesor')
  async create(
    @Body() dto: CreateServiceCasesDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const entity = await this.createUseCase.execute(dto, user.codeCompany);
      return {
        data: this.toResponse(entity),
        message: 'Servicio asociado al caso creado exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'SERVICE_COMPANY_NOT_FOUND'
      ) {
        throw new NotFoundException('Servicio no encontrado');
      }
      if (
        err instanceof Error &&
        err.message === 'CASE_RECORD_NOT_FOUND'
      ) {
        throw new NotFoundException('Caso no encontrado');
      }
      if (
        err instanceof Error &&
        err.message === 'SERVICE_ALREADY_IN_CASE'
      ) {
        throw new ConflictException(
          'El servicio ya esta inscrito en el caso',
        );
      }
      throw err;
    }
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador', 'asesor')
  async update(
    @Param('id', ParseIntPipe) idServiceCases: number,
    @Query('idCase', ParseIntPipe) idCase: number,
    @Body() dto: UpdateServiceCasesDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const entity = await this.updateUseCase.execute(
        idServiceCases,
        dto,
        idCase,
        user.codeCompany,
      );
      return {
        data: this.toResponse(entity),
        message: 'Servicio del caso actualizado exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'SERVICE_CASES_NOT_FOUND'
      ) {
        throw new NotFoundException('Servicio del caso no encontrado');
      }
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
    @Param('id', ParseIntPipe) idServiceCases: number,
    @Query('idCase', ParseIntPipe) idCase: number,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      await this.deleteUseCase.execute(idServiceCases, idCase, user.codeCompany);
      return {
        message: 'Servicio del caso eliminado exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'SERVICE_CASES_NOT_FOUND'
      ) {
        throw new NotFoundException('Servicio del caso no encontrado');
      }
      if (
        err instanceof Error &&
        err.message === 'CASE_RECORD_NOT_FOUND'
      ) {
        throw new NotFoundException('Caso no encontrado');
      }
      throw err;
    }
  }

  @Get()
  @UseGuards(RolesGuard)
  async list(
    @Query() query: QueryServiceCasesDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const currentCase = await this.getCurrentCaseUseCase.execute(
        user.userId,
        user.codeCompany,
      );
      const result = await this.listUseCase.execute(query, currentCase.idCase);
      return {
        message: 'Servicios del caso obtenidos exitosamente',
        data: result.data.map((entity) => this.toResponseWithRelations(entity)),
        pagination: {
          totalItems: result.totalItems,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          pageSize: result.pageSize,
          hasNextPage: result.hasNextPage,
          hasPreviousPage: result.hasPreviousPage,
        },
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

  @Get(':id')
  @UseGuards(RolesGuard)
  async getById(
    @Param('id', ParseIntPipe) idServiceCases: number,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const currentCase = await this.getCurrentCaseUseCase.execute(
        user.userId,
        user.codeCompany,
      );
      const entity = await this.getByIdUseCase.execute(
        idServiceCases,
        currentCase.idCase,
      );
      if (!entity) {
        throw new NotFoundException('Servicio del caso no encontrado');
      }
      return {
        data: this.toResponseWithRelations(entity),
        message: 'Servicio del caso encontrado exitosamente',
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

  private toResponse(entity: {
    idServiceCases: number | undefined;
    idCase: number;
    idServices: number;
    observation: string | null;
    createdAt: Date;
  }) {
    return {
      idServiceCases: entity.idServiceCases,
      idCase: entity.idCase,
      idService: entity.idServices,
      observations: entity.observation,
      createdAt: entity.createdAt,
    };
  }

  private toResponseWithRelations(entity: {
    idServiceCases: number;
    idCase: number;
    idServices: number;
    observation: string | null;
    createdAt: Date;
    serviceCompany: { idService: number; name: string; description: string };
    caseRecord: { idCase: number; caseCode: string };
    contracts: Array<{
      idContract: number;
      contractCode: string;
      idCase: number;
      digitalSignature: string | null;
      createdAt: Date;
    }>;
  }) {
    return {
      idServiceCases: entity.idServiceCases,
      idCase: entity.idCase,
      idService: entity.idServices,
      observations: entity.observation,
      createdAt: entity.createdAt,
      service: entity.serviceCompany,
      case: entity.caseRecord,
      contracts: entity.contracts,
    };
  }
}
