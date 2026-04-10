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
} from '@nestjs/common';
import { CreateCompanyDto } from '../../application/dto/company/create-company.dto';
import { QueryCompanyDto } from '../../application/dto/company/query-company.dto';
import { UpdateCompanyDto } from '../../application/dto/company/update-company.dto';
import { CreateCompanyUseCase } from '../../application/use-cases/company/create-company.use-case';
import { DeleteCompanyUseCase } from '../../application/use-cases/company/delete-company.use-case';
import { GetCompanyByIdUseCase } from '../../application/use-cases/company/get-company-by-id.use-case';
import { ListCompaniesUseCase } from '../../application/use-cases/company/list-companies.use-case';
import { UpdateCompanyUseCase } from '../../application/use-cases/company/update-company.use-case';
import { AuthContextUser } from '../../infrastructure/auth/decorators/auth-context.decorator';
import { AuthContext } from '../../application/auth/auth-context';

@Controller('companies')
export class CompanyController {
  constructor(
    private readonly createUseCase: CreateCompanyUseCase,
    private readonly updateUseCase: UpdateCompanyUseCase,
    private readonly deleteUseCase: DeleteCompanyUseCase,
    private readonly getByIdUseCase: GetCompanyByIdUseCase,
    private readonly listUseCase: ListCompaniesUseCase,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateCompanyDto,
    @AuthContextUser() authContext: AuthContext,
  ) {
    try {
      const entity = await this.createUseCase.execute(dto, authContext);
      return {
        data: entity,
        message: 'Empresa creada correctamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'FORBIDDEN_ROLE_SCOPE') {
        throw new ForbiddenException(
          'No tiene permisos para administrar compañías',
        );
      }
      throw err;
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) codeCompany: number,
    @Body() dto: UpdateCompanyDto,
    @AuthContextUser() authContext: AuthContext,
  ) {
    try {
      const entity = await this.updateUseCase.execute(codeCompany, dto, authContext);
      return {
        data: entity,
        message: 'Empresa actualizada correctamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'FORBIDDEN_ROLE_SCOPE') {
        throw new ForbiddenException(
          'No tiene permisos para administrar compañías',
        );
      }
      if (err instanceof Error && err.message === 'COMPANY_NOT_FOUND') {
        throw new NotFoundException('Empresa no encontrada');
      }
      throw err;
    }
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) codeCompany: number,
    @AuthContextUser() authContext: AuthContext,
  ) {
    try {
      await this.deleteUseCase.execute(codeCompany, authContext);
      return {
        message: 'Empresa eliminada correctamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'FORBIDDEN_ROLE_SCOPE') {
        throw new ForbiddenException(
          'No tiene permisos para administrar compañías',
        );
      }
      if (err instanceof Error && err.message === 'COMPANY_NOT_FOUND') {
        throw new NotFoundException('Empresa no encontrada');
      }
      throw err;
    }
  }

  @Get()
  async list(
    @Query() query: QueryCompanyDto,
    @AuthContextUser() authContext: AuthContext,
  ) {
    try {
      const result = await this.listUseCase.execute(query, authContext);
      return {
        message: 'Empresas obtenidas exitosamente',
        data: result.data.map((entity) => ({
          codeCompany: entity.codeCompany,
          nameCompany: entity.nameCompany,
          prefixCompany: entity.prefixCompany,
          stateCompany: entity.stateCompany,
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
    } catch (err) {
      if (err instanceof Error && err.message === 'FORBIDDEN_ROLE_SCOPE') {
        throw new ForbiddenException(
          'No tiene permisos para administrar compañías',
        );
      }
      throw err;
    }
  }

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) codeCompany: number,
    @AuthContextUser() authContext: AuthContext,
  ) {
    try {
      const entity = await this.getByIdUseCase.execute(codeCompany, authContext);
      if (!entity) {
        throw new NotFoundException('Empresa no encontrada');
      }
      return {
        data: entity,
        message: 'Empresa encontrada correctamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'FORBIDDEN_ROLE_SCOPE') {
        throw new ForbiddenException(
          'No tiene permisos para administrar compañías',
        );
      }
      throw err;
    }
  }
}
