import {
  BadRequestException,
  Body,
  ConflictException,
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
import { CreateContractDto } from '../../application/dto/contract/create-contract.dto';
import { QueryContractDto } from '../../application/dto/contract/query-contract.dto';
import { UpdateContractDto } from '../../application/dto/contract/update-contract.dto';
import { CreateContractUseCase } from '../../application/use-cases/contract/create-contract.use-case';
import { DeleteContractUseCase } from '../../application/use-cases/contract/delete-contract.use-case';
import { GetCaseRecordByIdUseCase } from '../../application/use-cases/case-record/get-case-record-by-id.use-case';
import { GetContractByIdUseCase } from '../../application/use-cases/contract/get-contract-by-id.use-case';
import { ListContractsByCaseUseCase } from '../../application/use-cases/contract/list-contracts-by-case.use-case';
import { ListContractsUseCase } from '../../application/use-cases/contract/list-contracts.use-case';
import { UpdateContractUseCase } from '../../application/use-cases/contract/update-contract.use-case';
import { ContractWithRelations } from '../../domain/repositories/contract.repository';
import { CurrentUser } from '../../infrastructure/auth/decorators/current-user.decorator';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';
import { JwtPayload } from '../../infrastructure/auth/strategies/jwt.strategy';

@Controller('contracts')
export class ContractController {
  constructor(
    private readonly createUseCase: CreateContractUseCase,
    private readonly updateUseCase: UpdateContractUseCase,
    private readonly deleteUseCase: DeleteContractUseCase,
    private readonly getByIdUseCase: GetContractByIdUseCase,
    private readonly listUseCase: ListContractsUseCase,
    private readonly listByCaseUseCase: ListContractsByCaseUseCase,
    private readonly getCaseRecordByIdUseCase: GetCaseRecordByIdUseCase,
  ) {}

  private async verifyCaseAccessForContract(
    idCase: number,
    user: JwtPayload,
  ): Promise<void> {
    const caseRecord = await this.getCaseRecordByIdUseCase.execute(
      idCase,
      user.userId,
      user.role,
      user.codeCompany,
    );
    if (!caseRecord) {
      throw new NotFoundException('Caso no encontrado');
    }
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('administrador', 'asesor')
  async create(@Body() dto: CreateContractDto) {
    try {
      const data = await this.createUseCase.execute(dto);
      return {
        data: this.toResponse(data),
        message: 'Contrato registrado exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'CASE_NOT_FOUND') {
        throw new NotFoundException('Caso no encontrado');
      }
      if (err instanceof Error && err.message === 'CASE_NOT_OPEN') {
        throw new BadRequestException(
          'Solo se puede registrar un contrato cuando el caso está abierto',
        );
      }
      if (
        err instanceof Error &&
        err.message === 'CONTRACT_CODE_GENERATION_FAILED'
      ) {
        throw new ConflictException(
          'No se pudo generar un código de contrato único. Intente nuevamente.',
        );
      }
      throw err;
    }
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador', 'asesor')
  async update(
    @Param('id', ParseIntPipe) idContract: number,
    @Body() dto: UpdateContractDto,
  ) {
    try {
      const data = await this.updateUseCase.execute(idContract, dto);
      return {
        data: this.toResponse(data),
        message: 'Contrato actualizado exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'CONTRACT_NOT_FOUND') {
        throw new NotFoundException('Contrato no encontrado');
      }
      throw err;
    }
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador', 'asesor')
  async delete(@Param('id', ParseIntPipe) idContract: number) {
    try {
      await this.deleteUseCase.execute(idContract);
      return {
        message: 'Contrato eliminado exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'CONTRACT_NOT_FOUND') {
        throw new NotFoundException('Contrato no encontrado');
      }
      throw err;
    }
  }

  @Get()
  @UseGuards(RolesGuard)
  async list(
    @Query() query: QueryContractDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const role = user.role?.toLowerCase() ?? '';
    if (role === 'cliente') {
      if (query.idCase === undefined || query.idCase === null) {
        throw new ForbiddenException(
          'Debe indicar el id del caso para listar contratos',
        );
      }
      await this.verifyCaseAccessForContract(query.idCase, user);
    }
    const result = await this.listUseCase.execute(query);
    return {
      message: 'Contratos obtenidos exitosamente',
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

  @Get('by-case/:idCase')
  @UseGuards(RolesGuard)
  async listByCase(
    @Param('idCase', ParseIntPipe) idCase: number,
    @Query() query: QueryContractDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      await this.verifyCaseAccessForContract(idCase, user);
      const result = await this.listByCaseUseCase.execute({
        idCase,
        page: query.page,
        pageSize: query.pageSize,
      });
      return {
        message: 'Contratos del caso obtenidos exitosamente',
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
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof Error && err.message === 'CASE_NOT_FOUND') {
        throw new NotFoundException('Caso no encontrado');
      }
      throw err;
    }
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  async getById(
    @Param('id', ParseIntPipe) idContract: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const entity = await this.getByIdUseCase.execute(idContract);
    if (!entity) {
      throw new NotFoundException('Contrato no encontrado');
    }
    await this.verifyCaseAccessForContract(entity.idCase, user);
    return {
      data: this.toResponse(entity),
      message: 'Contrato encontrado exitosamente',
    };
  }

  private toResponse(entity: ContractWithRelations) {
    return {
      idContract: entity.idContract,
      contractCode: entity.contractCode,
      idCase: entity.idCase,
      digitalSignature: entity.digitalSignature,
      createdAt: entity.createdAt,
      caseRecord: entity.caseRecord,
    };
  }
}
