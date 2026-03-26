import {Body,ConflictException,Controller,Delete,Get,NotFoundException,Param,ParseIntPipe,Post,Put,Query} from '@nestjs/common';
import { CreatePersonDto } from '../../application/dto/person/create-person.dto';
import { QueryPersonDto } from '../../application/dto/person/query-person.dto';
import { UpdatePersonDto } from '../../application/dto/person/update-person.dto';
import { CreatePersonUseCase } from '../../application/use-cases/person/create-person.use-case';
import { DeletePersonUseCase } from '../../application/use-cases/person/delete-person.use-case';
import { GetPersonByIdUseCase } from '../../application/use-cases/person/get-person-by-id.use-case';
import { ListPersonsUseCase } from '../../application/use-cases/person/list-persons.use-case';
import { UpdatePersonUseCase } from '../../application/use-cases/person/update-person.use-case';
import { Public } from 'src/infrastructure/auth/decorators/public.decorator';

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
  @Public()
  async create(@Body() dto: CreatePersonDto) {
    try {
      const entity = await this.createUseCase.execute(dto);
      return {
        data: entity,
        message: 'Persona creada exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'PERSON_CODE_GENERATION_FAILED') {
        throw new ConflictException('Could not generate unique person code. Please try again.');
      }
      throw err;
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) idPerson: number,
    @Body() dto: UpdatePersonDto,
  ) {
    try {
      const entity = await this.updateUseCase.execute(idPerson, dto);
      return {
        data: entity,
        message: 'Persona actualizada exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'PERSON_NOT_FOUND') {
        throw new NotFoundException('Person not found');
      }
      throw err;
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) idPerson: number) {
    try {
      await this.deleteUseCase.execute(idPerson);
      return {
        message: 'Persona eliminada exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'PERSON_NOT_FOUND') {
        throw new NotFoundException('Person not found');
      }
      throw err;
    }
  }
@Get()
@Public()
  async list(@Query() query: QueryPersonDto) {
    const result = await this.listUseCase.execute(query);
    return {
      message: 'Personas obtenidas exitosamente',
      data: result.data.map((entity) => ({
        idPerson: entity.idPerson,
        personCode: entity.personCode,
        fullName: entity.fullName,
        idTypeDocument: entity.idTypeDocument,
        documentNumber: entity.documentNumber,
        birthdate: entity.birthdate,
        idNationality: entity.idNationality,
        phone: entity.phone,
        email: entity.email,
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
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) idPerson: number) {
    const entity = await this.getByIdUseCase.execute(idPerson);
    if (!entity) {
      throw new NotFoundException('Person not found');
    }
    return {
      data: entity,
      message: 'Person found successfully',
    };
  }
}
