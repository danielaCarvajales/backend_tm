import {
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
} from '@nestjs/common';
import { CreatePersonDto } from '../../application/dto/person/create-person.dto';
import { QueryPersonDto } from '../../application/dto/person/query-person.dto';
import { UpdatePersonDto } from '../../application/dto/person/update-person.dto';
import { CreatePersonUseCase } from '../../application/use-cases/person/create-person.use-case';
import { DeletePersonUseCase } from '../../application/use-cases/person/delete-person.use-case';
import { GetPersonByIdUseCase } from '../../application/use-cases/person/get-person-by-id.use-case';
import { ListPersonsUseCase } from '../../application/use-cases/person/list-persons.use-case';
import { UpdatePersonUseCase } from '../../application/use-cases/person/update-person.use-case';
import { AuthContextUser } from '../../infrastructure/auth/decorators/auth-context.decorator';
import { AuthContext } from '../../application/auth/auth-context';

@Controller('persons')
export class PersonController {
  constructor(
    private readonly createUseCase: CreatePersonUseCase,
    private readonly updateUseCase: UpdatePersonUseCase,
    private readonly deleteUseCase: DeletePersonUseCase,
    private readonly getByIdUseCase: GetPersonByIdUseCase,
    private readonly listUseCase: ListPersonsUseCase,
  ) {}

  @Post()
  async create(
    @Body() dto: CreatePersonDto,
    @AuthContextUser() authContext: AuthContext,
  ) {
    try {
      const entity = await this.createUseCase.execute(dto, authContext);
      return {
        data: entity,
        message: 'Persona creada exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'PERSON_CODE_GENERATION_FAILED') {
        throw new ConflictException('No se pudo generar un código de persona único. Intente nuevamente.');
      }
      if (err instanceof Error && err.message === 'COMPANY_ID_REQUIRED') {
        throw new ConflictException(
          'Debe indicar una compañía para crear la persona',
        );
      }
      if (err instanceof Error && err.message === 'FORBIDDEN_ROLE_SCOPE') {
        throw new ForbiddenException(
          'No tiene permisos para crear personas',
        );
      }
      throw err;
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) idPerson: number,
    @Body() dto: UpdatePersonDto,
    @AuthContextUser() authContext: AuthContext,
  ) {
    try {
      const entity = await this.updateUseCase.execute(idPerson, dto, authContext);
      return {
        data: entity,
        message: 'Persona actualizada exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'PERSON_NOT_FOUND') {
        throw new NotFoundException('Persona no encontrada');
      }
      if (err instanceof Error && err.message === 'FORBIDDEN_ROLE_SCOPE') {
        throw new ForbiddenException('No tiene permisos para actualizar personas');
      }
      throw err;
    }
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) idPerson: number,
    @AuthContextUser() authContext: AuthContext,
  ) {
    try {
      await this.deleteUseCase.execute(idPerson, authContext);
      return {
        message: 'Persona eliminada exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'PERSON_NOT_FOUND') {
        throw new NotFoundException('Persona no encontrada');
      }
      if (err instanceof Error && err.message === 'FORBIDDEN_ROLE_SCOPE') {
        throw new ForbiddenException('No tiene permisos para eliminar personas');
      }
      throw err;
    }
  }

  @Get()
  async list(
    @Query() query: QueryPersonDto,
    @AuthContextUser() authContext: AuthContext,
  ) {
    try {
      const result = await this.listUseCase.execute(query, authContext);
      return {
        message: 'Personas obtenidas exitosamente',
        data: result.data.map((entity) => ({
          idPerson: entity.idPerson,
          companyId: entity.companyId,
          personCode: entity.personCode,
          fullName: entity.fullName,
          idTypeDocument: entity.idTypeDocument,
          documentNumber: entity.documentNumber,
          birthdate: entity.birthdate,
          idNationality: entity.idNationality,
          phone: entity.phone,
          email: entity.email,
          language: entity.language,
          typeDocument: entity.typeDocument,
          nationality: entity.nationality,
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
        throw new ForbiddenException('No tiene permisos para listar personas');
      }
      throw err;
    }
  }

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) idPerson: number,
    @AuthContextUser() authContext: AuthContext,
  ) {
    try {
      const entity = await this.getByIdUseCase.execute(idPerson, authContext);
      if (!entity) {
        throw new NotFoundException('Persona no encontrada');
      }
      return {
        data: entity,
        message: 'Persona encontrada exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'FORBIDDEN_ROLE_SCOPE') {
        throw new ForbiddenException('No tiene permisos para consultar personas');
      }
      throw err;
    }
  }
}
