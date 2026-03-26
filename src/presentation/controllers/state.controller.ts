import {Body,Controller,Delete,Get,NotFoundException,Param,ParseIntPipe,Post,Put,Query} from '@nestjs/common';
import { CreateStateDto } from '../../application/dto/state/create-state.dto';
import { QueryStateDto } from '../../application/dto/state/query-state.dto';
import { UpdateStateDto } from '../../application/dto/state/update-state.dto';
import { CreateStateUseCase } from '../../application/use-cases/state/create-state.use-case';
import { DeleteStateUseCase } from '../../application/use-cases/state/delete-state.use-case';
import { GetStateByIdUseCase } from '../../application/use-cases/state/get-state-by-id.use-case';
import { ListStatesUseCase } from '../../application/use-cases/state/list-states.use-case';
import { UpdateStateUseCase } from '../../application/use-cases/state/update-state.use-case';

@Controller('states')
export class StateController {
  constructor(
    private readonly createUseCase: CreateStateUseCase,
    private readonly updateUseCase: UpdateStateUseCase,
    private readonly deleteUseCase: DeleteStateUseCase,
    private readonly getByIdUseCase: GetStateByIdUseCase,
    private readonly listUseCase: ListStatesUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateStateDto) {
    const entity = await this.createUseCase.execute(dto);
    return {
      data: entity,
      message: 'Estado creado exitosamente',
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) idState: number,
    @Body() dto: UpdateStateDto,
  ) {
    try {
      const entity = await this.updateUseCase.execute(idState, dto);
      return {
        data: entity,
        message: 'Estado actualizado exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'STATE_NOT_FOUND') {
        throw new NotFoundException('State not found');
      }
      throw err;
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) idState: number) {
    try {
      await this.deleteUseCase.execute(idState);
      return {
        message: 'Estado eliminado exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'STATE_NOT_FOUND') {
        throw new NotFoundException('State not found');
      }
      throw err;
    }
  }

  @Get()
  async list(@Query() query: QueryStateDto) {
    const result = await this.listUseCase.execute(query);
    return {
      message: 'Estados obtenidos exitosamente',
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
      throw new NotFoundException('State not found');
    }
    return {
      data: entity,
      message: 'Estado encontrado exitosamente',
    };
  }
}
