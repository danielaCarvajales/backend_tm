import {Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query, UseGuards} from '@nestjs/common';
import { CreateServiceCompanyDto } from '../../application/dto/service-company/create-service-company.dto';
import { QueryServiceCompanyDto } from '../../application/dto/service-company/query-service-company.dto';
import { UpdateServiceCompanyDto } from '../../application/dto/service-company/update-service-company.dto';
import { CreateServiceCompanyUseCase } from '../../application/use-cases/service-company/create-service-company.use-case';
import { DeleteServiceCompanyUseCase } from '../../application/use-cases/service-company/delete-service-company.use-case';
import { GetServiceCompanyByIdUseCase } from '../../application/use-cases/service-company/get-service-company-by-id.use-case';
import { ListServiceCompaniesUseCase } from '../../application/use-cases/service-company/list-service-companies.use-case';
import { UpdateServiceCompanyUseCase } from '../../application/use-cases/service-company/update-service-company.use-case';
import { CurrentUser } from '../../infrastructure/auth/decorators/current-user.decorator';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator';
import { JwtPayload } from '../../infrastructure/auth/strategies/jwt.strategy';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';

@Controller('service-companies')
export class ServiceCompanyController {
  constructor(
    private readonly createUseCase: CreateServiceCompanyUseCase,
    private readonly updateUseCase: UpdateServiceCompanyUseCase,
    private readonly deleteUseCase: DeleteServiceCompanyUseCase,
    private readonly getByIdUseCase: GetServiceCompanyByIdUseCase,
    private readonly listUseCase: ListServiceCompaniesUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('administrador', 'asesor')
  async create(
    @Body() dto: CreateServiceCompanyDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const entity = await this.createUseCase.execute(dto, user.codeCompany);
    return {
      data: entity,
      message: 'Servicio de empresa creado exitosamente',
    };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador', 'asesor')
  async update(
    @Param('id', ParseIntPipe) idService: number,
    @Body() dto: UpdateServiceCompanyDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const entity = await this.updateUseCase.execute(
        idService,
        dto,
        user.codeCompany,
      );
      return {
        data: entity,
        message: 'Servicio de empresa actualizado exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'SERVICE_COMPANY_NOT_FOUND'
      ) {
        throw new NotFoundException('Servicio de empresa no encontrado');
      }
      throw err;
    }
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador', 'asesor')
  async delete(
    @Param('id', ParseIntPipe) idService: number,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      await this.deleteUseCase.execute(idService, user.codeCompany);
      return {
        message: 'Servicio de empresa eliminado exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'SERVICE_COMPANY_NOT_FOUND'
      ) {
        throw new NotFoundException('Servicio de empresa no encontrado');
      }
      throw err;
    }
  }

  @Get()
  async list(
    @Query() query: QueryServiceCompanyDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.listUseCase.execute(query, user.codeCompany);
    return {
      message: 'Servicios de empresa obtenidos exitosamente',
      data: result.data.map((entity) => ({
        idService: entity.idService,
        codeCompany: entity.codeCompany,
        name: entity.name,
        description: entity.description,
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
  async getById(
    @Param('id', ParseIntPipe) idService: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const entity = await this.getByIdUseCase.execute(
      idService,
      user.codeCompany,
    );
    if (!entity) {
      throw new NotFoundException('Servicio de empresa no encontrado');
    }
    return {
      data: entity,
      message: 'Servicio de empresa encontrado exitosamente',
    };
  }
}
