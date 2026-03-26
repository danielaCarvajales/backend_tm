import {Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query} from '@nestjs/common';
import { CreateStateCaseDto } from '../../application/dto/state-case/create-state-case.dto';
import { QueryStateCaseDto } from '../../application/dto/state-case/query-state-case.dto';
import { UpdateStateCaseDto } from '../../application/dto/state-case/update-state-case.dto';
import { CreateStateCaseUseCase } from '../../application/use-cases/state-case/create-state-case.use-case';
import { DeleteStateCaseUseCase } from '../../application/use-cases/state-case/delete-state-case.use-case';
import { GetStateCaseByIdUseCase } from '../../application/use-cases/state-case/get-state-case-by-id.use-case';
import { ListStateCasesUseCase } from '../../application/use-cases/state-case/list-state-cases.use-case';
import { UpdateStateCaseUseCase } from '../../application/use-cases/state-case/update-state-case.use-case';

@Controller('state-cases')
export class StateCaseController {
  constructor(
    private readonly createUseCase: CreateStateCaseUseCase,
    private readonly updateUseCase: UpdateStateCaseUseCase,
    private readonly deleteUseCase: DeleteStateCaseUseCase,
    private readonly getByIdUseCase: GetStateCaseByIdUseCase,
    private readonly listUseCase: ListStateCasesUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateStateCaseDto) {
    try {
      const entity = await this.createUseCase.execute(dto);
      return {
        data: entity,
        message: 'Estado de caso creado exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'STATE_CASE_NAME_ALREADY_EXISTS') {
        throw new ConflictException('Ya existe un estado de caso con ese nombre');
      }
      throw err;
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) idState: number,
    @Body() dto: UpdateStateCaseDto,
  ) {
    try {
      const entity = await this.updateUseCase.execute(idState, dto);
      return {
        data: entity,
        message: 'Estado de caso actualizado exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'STATE_CASE_NOT_FOUND') {
        throw new NotFoundException('Estado de caso no encontrado');
      }
      if (err instanceof Error && err.message === 'STATE_CASE_NAME_ALREADY_EXISTS') {
        throw new ConflictException('Ya existe un estado de caso con ese nombre');
      }
      throw err;
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) idState: number) {
    try {
      await this.deleteUseCase.execute(idState);
      return {
        message: 'Estado de caso eliminado exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'STATE_CASE_NOT_FOUND') {
        throw new NotFoundException('Estado de caso no encontrado');
      }
      if (err instanceof Error && err.message === 'STATE_CASE_IN_USE') {
        throw new ConflictException(
          'No se puede eliminar: el estado está siendo usado por uno o más casos',
        );
      }
      throw err;
    }
  }

  @Get()
  async list(@Query() query: QueryStateCaseDto) {
    const result = await this.listUseCase.execute(query);
    return {
      message: 'Estados de caso obtenidos exitosamente',
      data: result.data.map((entity) => ({
        idState: entity.idState,
        nameState: entity.nameState,
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
  async getById(@Param('id', ParseIntPipe) idState: number) {
    const entity = await this.getByIdUseCase.execute(idState);
    if (!entity) {
      throw new NotFoundException('Estado de caso no encontrado');
    }
    return {
      data: entity,
      message: 'Estado de caso encontrado exitosamente',
    };
  }
}
