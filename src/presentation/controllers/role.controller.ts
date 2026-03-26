import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';  
import { CreateRoleDto } from '../../application/dto/role/create-role.dto';
import { QueryRoleDto } from '../../application/dto/role/query-role.dto';
import { UpdateRoleDto } from '../../application/dto/role/update-role.dto';
import { CreateRoleUseCase } from '../../application/use-cases/role/create-role.use-case';
import { DeleteRoleUseCase } from '../../application/use-cases/role/delete-role.use-case';
import { GetRoleByIdUseCase } from '../../application/use-cases/role/get-role-by-id.use-case';
import { ListRolesUseCase } from '../../application/use-cases/role/list-roles.use-case';
import { UpdateRoleUseCase } from '../../application/use-cases/role/update-role.use-case';

@Controller('roles')
export class RoleController {
  constructor(
    private readonly createUseCase: CreateRoleUseCase,
    private readonly updateUseCase: UpdateRoleUseCase,
    private readonly deleteUseCase: DeleteRoleUseCase,
    private readonly getByIdUseCase: GetRoleByIdUseCase,
    private readonly listUseCase: ListRolesUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateRoleDto) {
    const entity = await this.createUseCase.execute(dto);
    return {
      data: { idRole: entity.idRole, name: entity.name },
      message: 'Rol creado correctamente',
    };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    try {
      const entity = await this.updateUseCase.execute(id, dto);
      return {
        data: { idRole: entity.idRole, name: entity.name },
        message: 'Rol actualizado correctamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'ROLE_NOT_FOUND') {
        throw new NotFoundException('Rol no encontrado');
      }
      throw err;
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.deleteUseCase.execute(id);
      return {
        message: 'Rol eliminado correctamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'ROLE_NOT_FOUND') {
        throw new NotFoundException('Rol no encontrado');
      }
      throw err;
    }
  }

  @Get()
  async list(@Query() query: QueryRoleDto) {
    const result = await this.listUseCase.execute(query);
    return {
      data: result.data.map((e) => ({ idRole: e.idRole, name: e.name })),
      message: 'Roles obtenidos exitosamente',
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
  async getById(@Param('id', ParseIntPipe) id: number) {
    const entity = await this.getByIdUseCase.execute(id);
    if (!entity) {
      throw new NotFoundException('Rol no encontrado');
    }
    return {
      data: { idRole: entity.idRole, name: entity.name },
      message: 'Rol encontrado correctamente',
    };
  }
}
