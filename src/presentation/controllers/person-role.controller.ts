import {Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query} from '@nestjs/common';
import { CreatePersonRoleDto } from '../../application/dto/person-role/create-person-role.dto';
import { QueryPersonRoleDto } from '../../application/dto/person-role/query-person-role.dto';
import { UpdatePersonRoleDto } from '../../application/dto/person-role/update-person-role.dto';
import { CreatePersonRoleUseCase } from '../../application/use-cases/person-role/create-person-role.use-case';
import { DeletePersonRoleUseCase } from '../../application/use-cases/person-role/delete-person-role.use-case';
import { GetPersonRoleByIdUseCase } from '../../application/use-cases/person-role/get-person-role-by-id.use-case';
import { ListPersonRolesUseCase } from '../../application/use-cases/person-role/list-person-roles.use-case';
import { UpdatePersonRoleUseCase } from '../../application/use-cases/person-role/update-person-role.use-case';
import { Public } from 'src/infrastructure/auth/decorators/public.decorator';

const toResponse = (entity: {
  idPersonRole?: number;
  idPerson: number;
  idRole: number;
  codeCompany: number;
  idState: number;
  assignmentDate: Date;
  revocationDate: Date | null;
  roleName?: string;
}) => ({
  idPersonRole: entity.idPersonRole,
  idPerson: entity.idPerson,
  idRole: entity.idRole,
  codeCompany: entity.codeCompany,
  idState: entity.idState,
  assignmentDate: entity.assignmentDate,
  revocationDate: entity.revocationDate,
  roleName: entity.roleName,
});

@Controller('person-roles')
export class PersonRoleController {
  constructor(
    private readonly createUseCase: CreatePersonRoleUseCase,
    private readonly updateUseCase: UpdatePersonRoleUseCase,
    private readonly deleteUseCase: DeletePersonRoleUseCase,
    private readonly getByIdUseCase: GetPersonRoleByIdUseCase,
    private readonly listUseCase: ListPersonRolesUseCase,
  ) {}


  @Post()
  @Public()
  async create(@Body() dto: CreatePersonRoleDto) {
    const entity = await this.createUseCase.execute(dto);
    return {
      data: toResponse({ ...entity, roleName: undefined }),
      message: 'Rol asignado correctamente a la persona',
    };
  }

  @Put(':id')
  @Public()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonRoleDto,
  ) {
    try {
      const entity = await this.updateUseCase.execute(id, dto);
      return {
        data: toResponse({ ...entity, roleName: undefined }),
        message: 'Asignación de rol actualizada correctamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'PERSON_ROLE_NOT_FOUND') {
        throw new NotFoundException('Asignación de rol no encontrada');
      }
      throw err;
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.deleteUseCase.execute(id);
      return {
        message: 'Asignación de rol eliminada correctamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'PERSON_ROLE_NOT_FOUND') {
        throw new NotFoundException('Asignación de rol no encontrada');
      }
      throw err;
    }
  }

  @Get()
  async list(@Query() query: QueryPersonRoleDto) {
    const result = await this.listUseCase.execute(query);
    return {
      data: result.data.map((e) => toResponse(e)),
      message: 'Asignaciones de rol obtenidas exitosamente',
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
      throw new NotFoundException('Asignación de rol no encontrada');
    }
    return {
      data: toResponse({ ...entity, roleName: undefined }),
      message: 'Asignación de rol encontrada correctamente',
    };
  }
}
