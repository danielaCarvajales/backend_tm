import {Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query, UseGuards} from '@nestjs/common';
import { CreateFamilyRelationshipDto } from '../../application/dto/family-relationship/create-family-relationship.dto';
import { QueryFamilyRelationshipDto } from '../../application/dto/family-relationship/query-family-relationship.dto';
import { UpdateFamilyRelationshipDto } from '../../application/dto/family-relationship/update-family-relationship.dto';
import { CreateFamilyRelationshipUseCase } from '../../application/use-cases/family-relationship/create-family-relationship.use-case';
import { DeleteFamilyRelationshipUseCase } from '../../application/use-cases/family-relationship/delete-family-relationship.use-case';
import { GetFamilyRelationshipByIdUseCase } from '../../application/use-cases/family-relationship/get-family-relationship-by-id.use-case';
import { ListFamilyRelationshipsUseCase } from '../../application/use-cases/family-relationship/list-family-relationships.use-case';
import { UpdateFamilyRelationshipUseCase } from '../../application/use-cases/family-relationship/update-family-relationship.use-case';
import { RolesGuard } from 'src/infrastructure/auth/guards/roles.guard';
import { Roles } from 'src/infrastructure/auth/decorators/roles.decorator';

@Controller('family-relationships')
export class FamilyRelationshipController {
  constructor(
    private readonly createUseCase: CreateFamilyRelationshipUseCase,
    private readonly updateUseCase: UpdateFamilyRelationshipUseCase,
    private readonly deleteUseCase: DeleteFamilyRelationshipUseCase,
    private readonly getByIdUseCase: GetFamilyRelationshipByIdUseCase,
    private readonly listUseCase: ListFamilyRelationshipsUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async create(@Body() dto: CreateFamilyRelationshipDto) {
    try {
      const entity = await this.createUseCase.execute(dto);
      return {
        data: {
          idFamilyRelationship: entity.idFamilyRelationship,
          nameFamilyRelationship: entity.nameFamilyRelationship,
        },
        message: 'Relación familiar creada exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'FAMILY_RELATIONSHIP_NAME_ALREADY_EXISTS'
      ) {
        throw new ConflictException(
          'Ya existe una relación familiar con ese nombre',
        );
      }
      throw err;
    }
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async update(
    @Param('id', ParseIntPipe) idFamilyRelationship: number,
    @Body() dto: UpdateFamilyRelationshipDto,
  ) {
    try {
      const entity = await this.updateUseCase.execute(
        idFamilyRelationship,
        dto,
      );
      return {
        data: {
          idFamilyRelationship: entity.idFamilyRelationship,
          nameFamilyRelationship: entity.nameFamilyRelationship,
        },
        message: 'Relación familiar actualizada exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'FAMILY_RELATIONSHIP_NOT_FOUND'
      ) {
        throw new NotFoundException('Relación familiar no encontrada');
      }
      if (
        err instanceof Error &&
        err.message === 'FAMILY_RELATIONSHIP_NAME_ALREADY_EXISTS'
      ) {
        throw new ConflictException(
          'Ya existe una relación familiar con ese nombre',
        );
      }
      throw err;
    }
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async delete(
    @Param('id', ParseIntPipe) idFamilyRelationship: number,
  ) {
    try {
      await this.deleteUseCase.execute(idFamilyRelationship);
      return {
        message: 'Relación familiar eliminada exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'FAMILY_RELATIONSHIP_NOT_FOUND'
      ) {
        throw new NotFoundException('Relación familiar no encontrada');
      }
      if (
        err instanceof Error &&
        err.message === 'FAMILY_RELATIONSHIP_IN_USE'
      ) {
        throw new ConflictException(
          'No se puede eliminar: la relación familiar está siendo usada por uno o más casos',
        );
      }
      throw err;
    }
  }

  @Get()
  async list(@Query() query: QueryFamilyRelationshipDto) {
    const result = await this.listUseCase.execute(query);
    return {
      message: 'Relaciones familiares obtenidas exitosamente',
      data: result.data.map((entity) => ({
        idFamilyRelationship: entity.idFamilyRelationship,
        nameFamilyRelationship: entity.nameFamilyRelationship,
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
    @Param('id', ParseIntPipe) idFamilyRelationship: number,
  ) {
    const entity = await this.getByIdUseCase.execute(idFamilyRelationship);
    if (!entity) {
      throw new NotFoundException('Relación familiar no encontrada');
    }
    return {
      data: {
        idFamilyRelationship: entity.idFamilyRelationship,
        nameFamilyRelationship: entity.nameFamilyRelationship,
      },
      message: 'Relación familiar encontrada exitosamente',
    };
  }
}
