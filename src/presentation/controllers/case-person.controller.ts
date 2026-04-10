import {BadRequestException,Body,ConflictException,Controller, Delete, ForbiddenException, Get,
   NotFoundException, Param, ParseIntPipe, Post, Put, Query, UseGuards} from '@nestjs/common';
import { CreateCasePersonDto } from '../../application/dto/case-person/create-case-person.dto';
import { QueryCasePersonDto } from '../../application/dto/case-person/query-case-person.dto';
import { UpdateCasePersonDto } from '../../application/dto/case-person/update-case-person.dto';
import { CreateCasePersonUseCase } from '../../application/use-cases/case-person/create-case-person.use-case';
import { DeleteCasePersonUseCase } from '../../application/use-cases/case-person/delete-case-person.use-case';
import { GetCasePersonByIdUseCase } from '../../application/use-cases/case-person/get-case-person-by-id.use-case';
import { ListCasePersonsUseCase } from '../../application/use-cases/case-person/list-case-persons.use-case';
import { UpdateCasePersonUseCase } from '../../application/use-cases/case-person/update-case-person.use-case';
import { ResolveCaseIdForCasePersonUseCase } from '../../application/use-cases/case-person/resolve-case-id-for-case-person.use-case';
import { GetCaseRecordByIdUseCase } from '../../application/use-cases/case-record/get-case-record-by-id.use-case';
import { CurrentUser } from '../../infrastructure/auth/decorators/current-user.decorator';
import { JwtPayload } from '../../infrastructure/auth/strategies/jwt.strategy';
import { Roles } from 'src/infrastructure/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/infrastructure/auth/guards/roles.guard';

@Controller('case-persons')
export class CasePersonController {
  constructor(
    private readonly createUseCase: CreateCasePersonUseCase,
    private readonly updateUseCase: UpdateCasePersonUseCase,
    private readonly deleteUseCase: DeleteCasePersonUseCase,
    private readonly getByIdUseCase: GetCasePersonByIdUseCase,
    private readonly listUseCase: ListCasePersonsUseCase,
    private readonly resolveCaseIdUseCase: ResolveCaseIdForCasePersonUseCase,
    private readonly getCaseRecordByIdUseCase: GetCaseRecordByIdUseCase,
  ) {}

  private canChangeStatePerson(role: string): boolean {
    const r = role?.toLowerCase() ?? '';
    return r === 'asesor' || r === 'administrador';
  }

  private async verifyCaseAccess(
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
  async create(@Body() dto: CreateCasePersonDto, @CurrentUser() user: JwtPayload) {
    try {
      const idCase = await this.resolveCaseIdUseCase.execute(user, dto.idCase);
      const result = await this.createUseCase.execute(dto, idCase);

      if ('existingPerson' in result) {
        throw new ConflictException({
          message:
            'Ya existe una persona con el mismo nombre completo, número de documento y tipo de documento en el caso. Confirme si desea continuar.',
          code: 'PERSON_ALREADY_IN_CASE',
          existingPerson: result.existingPerson,
        });
      }

      return {
        data: {
          idCasePerson: result.idCasePerson,
          idCase: result.idCase,
          idPerson: result.idPerson,
          idFamilyRelationship: result.idFamilyRelationship,
          statePerson: result.statePerson,
          createdAt: result.createdAt,
          observation: result.observation,
        },
        message: 'Persona asociada al caso creada exitosamente',
      };
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      if (err instanceof NotFoundException) throw err;
      if (err instanceof Error && err.message === 'CASE_NOT_FOUND') {
        throw new NotFoundException('Caso no encontrado');
      }
      if (err instanceof Error && err.message === 'CASE_ID_REQUIRED_FOR_ROLE') {
        throw new BadRequestException(
          'Los asesores y administradores deben indicar el id del caso (idCase) en el cuerpo de la solicitud',
        );
      }
      if (err instanceof Error && err.message === 'PERSON_NOT_FOUND') {
        throw new NotFoundException('Persona no encontrada');
      }
      if (
        err instanceof Error &&
        err.message === 'FAMILY_RELATIONSHIP_NOT_FOUND'
      ) {
        throw new NotFoundException('Relación familiar no encontrada');
      }
      throw err;
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) idCasePerson: number,
    @Body() dto: UpdateCasePersonDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const existing = await this.getByIdUseCase.execute(idCasePerson);
    if (!existing) {
      throw new NotFoundException('Persona del caso no encontrada');
    }

    await this.verifyCaseAccess(existing.idCase, user);

    try {
      const entity = await this.updateUseCase.execute(
        idCasePerson,
        dto,
        this.canChangeStatePerson(user.role),
      );
      return {
        data: this.toResponse(entity),
        message: 'Persona del caso actualizada exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'CASE_PERSON_STATE_CHANGE_FORBIDDEN') {
        throw new ForbiddenException(
          'Solo asesores y administradores pueden modificar el estado de la persona',
        );
      }
      if (
        err instanceof Error &&
        err.message === 'FAMILY_RELATIONSHIP_NOT_FOUND'
      ) {
        throw new NotFoundException('Relación familiar no encontrada');
      }
      throw err;
    }
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) idCasePerson: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const existing = await this.getByIdUseCase.execute(idCasePerson);
    if (!existing) {
      throw new NotFoundException('Persona del caso no encontrada');
    }

    await this.verifyCaseAccess(existing.idCase, user);

    try {
      await this.deleteUseCase.execute(idCasePerson);
      return {
        message: 'Persona del caso eliminada exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'CASE_PERSON_NOT_FOUND') {
        throw new NotFoundException('Persona del caso no encontrada');
      }
      throw err;
    }
  }

  @Get()
  async list(
    @Query() query: QueryCasePersonDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.verifyCaseAccess(query.caseId, user);

    const result = await this.listUseCase.execute(query);
    return {
      message: 'Personas del caso obtenidas exitosamente',
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
  }

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) idCasePerson: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const entity = await this.getByIdUseCase.execute(idCasePerson);
    if (!entity) {
      throw new NotFoundException('Persona del caso no encontrada');
    }

    await this.verifyCaseAccess(entity.idCase, user);

    return {
      data: this.toResponseWithRelations(entity),
      message: 'Persona del caso encontrada exitosamente',
    };
  }

  private toResponse(entity: {
    idCasePerson: number | undefined;
    idCase: number;
    idPerson: number;
    idFamilyRelationship: number;
    statePerson: number;
    createdAt: Date;
    observation: string | null;
  }) {
    return {
      idCasePerson: entity.idCasePerson,
      idCase: entity.idCase,
      idPerson: entity.idPerson,
      idFamilyRelationship: entity.idFamilyRelationship,
      statePerson: entity.statePerson,
      createdAt: entity.createdAt,
      observation: entity.observation,
    };
  }

  private toResponseWithRelations(entity: {
    idCasePerson: number;
    idCase: number;
    idPerson: number;
    idFamilyRelationship: number;
    statePerson: number;
    createdAt: Date;
    observation: string | null;
    person: {
      idPerson: number;
      fullName: string;
      documentNumber: string;
      idTypeDocument: number;
      email: string;
      phone: string;
    };
    familyRelationship: {
      idFamilyRelationship: number;
      nameFamilyRelationship: string;
    };
    contracts: Array<{
      idContract: number;
      contractCode: string;
      idCase: number;
      digitalSignature: string | null;
      createdAt: Date;
    }>;
  }) {
    return {
      idCasePerson: entity.idCasePerson,
      idCase: entity.idCase,
      idPerson: entity.idPerson,
      idFamilyRelationship: entity.idFamilyRelationship,
      statePerson: entity.statePerson,
      createdAt: entity.createdAt,
      observation: entity.observation,
      person: entity.person,
      familyRelationship: entity.familyRelationship,
      contracts: entity.contracts,
    };
  }
}
