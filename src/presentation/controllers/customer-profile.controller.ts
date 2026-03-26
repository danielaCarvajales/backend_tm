import {Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query, UseGuards} from '@nestjs/common';
import { CreateCustomerProfileDto } from '../../application/dto/customer-profile/create-customer-profile.dto';
import { QueryCustomerProfileDto } from '../../application/dto/customer-profile/query-customer-profile.dto';
import { UpdateCustomerProfileDto } from '../../application/dto/customer-profile/update-customer-profile.dto';
import { CreateCustomerProfileUseCase } from '../../application/use-cases/customer-profile/create-customer-profile.use-case';
import { DeleteCustomerProfileUseCase } from '../../application/use-cases/customer-profile/delete-customer-profile.use-case';
import { GetCustomerProfileByIdUseCase } from '../../application/use-cases/customer-profile/get-customer-profile-by-id.use-case';
import { ListCustomerProfilesUseCase } from '../../application/use-cases/customer-profile/list-customer-profiles.use-case';
import { UpdateCustomerProfileUseCase } from '../../application/use-cases/customer-profile/update-customer-profile.use-case';
import { RolesGuard } from 'src/infrastructure/auth/guards/roles.guard';

@Controller('customer-profiles')
export class CustomerProfileController {
  constructor(
    private readonly createUseCase: CreateCustomerProfileUseCase,
    private readonly updateUseCase: UpdateCustomerProfileUseCase,
    private readonly deleteUseCase: DeleteCustomerProfileUseCase,
    private readonly getByIdUseCase: GetCustomerProfileByIdUseCase,
    private readonly listUseCase: ListCustomerProfilesUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateCustomerProfileDto) {
    const entity = await this.createUseCase.execute(dto);
    return {
      data: entity,
      message: 'Perfil de cliente creado correctamente',
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) idCustomerProfile: number,
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    try {
      const entity = await this.updateUseCase.execute(idCustomerProfile, dto);
      return {
        data: entity,
        message: 'Perfil de cliente actualizado correctamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'CUSTOMER_PROFILE_NOT_FOUND') {
        throw new NotFoundException('Perfil de cliente no encontrado');
      }
      throw err;
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) idCustomerProfile: number) {
    try {
      await this.deleteUseCase.execute(idCustomerProfile);
      return {
        message: 'Perfil de cliente eliminado correctamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'CUSTOMER_PROFILE_NOT_FOUND') {
        throw new NotFoundException('Perfil de cliente no encontrado');
      }
      throw err;
    }
  }

  @Get()
  async list(@Query() query: QueryCustomerProfileDto) {
    const result = await this.listUseCase.execute(query);
    return {
      data: result.data.map((entity) => ({
        idCustomerProfile: entity.idCustomerProfile,
        idPersonRole: entity.idPersonRole,
        codeCustomer: entity.codeCustomer,
        createdAt: entity.createdAt,
      })),
      message: 'Perfiles de cliente obtenidos exitosamente',
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
  async getById(@Param('id', ParseIntPipe) idCustomerProfile: number) {
    const entity = await this.getByIdUseCase.execute(idCustomerProfile);
    if (!entity) {
      throw new NotFoundException('Perfil de cliente no encontrado');
    }
    return {
      data: entity,
      message: 'Perfil de cliente encontrado correctamente',
    };
  }
}
