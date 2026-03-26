import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { CreateNationalityDto } from '../../application/dto/nationality/create-nationality.dto';
import { QueryNationalityDto } from '../../application/dto/nationality/query-nationality.dto';
import { UpdateNationalityDto } from '../../application/dto/nationality/update-nationality.dto';
import { CreateNationalityUseCase } from '../../application/use-cases/nationality/create-nationality.use-case';
import { DeleteNationalityUseCase } from '../../application/use-cases/nationality/delete-nationality.use-case';
import { GetNationalityByIdUseCase } from '../../application/use-cases/nationality/get-nationality-by-id.use-case';
import { ListNationalitiesUseCase } from '../../application/use-cases/nationality/list-nationalities.use-case';
import { UpdateNationalityUseCase } from '../../application/use-cases/nationality/update-nationality.use-case';
import { Public } from 'src/infrastructure/auth/decorators/public.decorator';

@Controller('nationalities')
export class NationalityController {
  constructor(
    private readonly createUseCase: CreateNationalityUseCase,
    private readonly updateUseCase: UpdateNationalityUseCase,
    private readonly deleteUseCase: DeleteNationalityUseCase,
    private readonly getByIdUseCase: GetNationalityByIdUseCase,
    private readonly listUseCase: ListNationalitiesUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateNationalityDto) {
    const entity = await this.createUseCase.execute(dto);
    return {
      data: entity,
      message: 'Nationalidad creada exitosamente',
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) idNacionality: number,
    @Body() dto: UpdateNationalityDto,
  ) {
    try {
      const entity = await this.updateUseCase.execute(idNacionality, dto);
      return {
        data: entity,
        message: 'Nationalidad actualizada exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'NATIONALITY_NOT_FOUND') {
        throw new NotFoundException('Nationality not found');
      }
      throw err;
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) idNacionality: number) {
    try {
      await this.deleteUseCase.execute(idNacionality);
      return {
        message: 'Nationalidad eliminada exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'NATIONALITY_NOT_FOUND') {
        throw new NotFoundException('Nationality not found');
      }
      throw err;
    }
  }

  @Get()
  @Public()
  async list(@Query() query: QueryNationalityDto) {
    const result = await this.listUseCase.execute(query);
    return {
      message: 'Nationalidades obtenidas exitosamente',
      data: result.data.map((entity) => ({
        idNacionality: entity.idNacionality,
        name: entity.name,
        abbreviation: entity.abbreviation,
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
  async getById(@Param('id', ParseIntPipe) idNacionality: number) {
    const entity = await this.getByIdUseCase.execute(idNacionality);
    if (!entity) {
      throw new NotFoundException('Nationality not found');
    }
    return {
      data: entity,
      message: 'Nationalidad encontrada exitosamente',
    };
  }
}
