import {Body,Controller,Delete,Get,NotFoundException,Param,ParseIntPipe,Post,Put,Query} from '@nestjs/common';
import { CreateCredentialsDto } from '../../application/dto/credentials/create-credentials.dto';
import { QueryCredentialsDto } from '../../application/dto/credentials/query-credentials.dto';
import { UpdateCredentialsDto } from '../../application/dto/credentials/update-credentials.dto';
import { CreateCredentialsUseCase } from '../../application/use-cases/credentials/create-credentials.use-case';
import { DeleteCredentialsUseCase } from '../../application/use-cases/credentials/delete-credentials.use-case';
import { GetCredentialsByIdUseCase } from '../../application/use-cases/credentials/get-credentials-by-id.use-case';
import { ListCredentialsUseCase } from '../../application/use-cases/credentials/list-credentials.use-case';
import { UpdateCredentialsUseCase } from '../../application/use-cases/credentials/update-credentials.use-case';
import { Public } from 'src/infrastructure/auth/decorators/public.decorator';

// Helper to exclude password and brute-force fields from API responses.
const toSafeResponse = (entity: {
  id?: number;
  username: string;
  state: number;
  lastAccess: Date;
  idPerson: number;
  codeCompany: number;
}) => ({
  id: entity.id,
  username: entity.username,
  state: entity.state,
  lastAccess: entity.lastAccess,
  idPerson: entity.idPerson,
  codeCompany: entity.codeCompany,
});

@Controller('credentials')
export class CredentialsController {
  constructor(
    private readonly createUseCase: CreateCredentialsUseCase,
    private readonly updateUseCase: UpdateCredentialsUseCase,
    private readonly deleteUseCase: DeleteCredentialsUseCase,
    private readonly getByIdUseCase: GetCredentialsByIdUseCase,
    private readonly listUseCase: ListCredentialsUseCase,
  ) {}

  @Public()
  @Post()
  async create(@Body() dto: CreateCredentialsDto) {
    const entity = await this.createUseCase.execute(dto);
    return {
      data: toSafeResponse(entity),
      message: 'Credencial creada correctamente',
    };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCredentialsDto) {
    try {
      const entity = await this.updateUseCase.execute(id, dto);
      return {
        data: toSafeResponse(entity),
        message: 'Credencial actualizada correctamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'CREDENTIALS_NOT_FOUND') {
        throw new NotFoundException('Credencial no encontrada');
      }
      throw err;
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.deleteUseCase.execute(id);
      return {
        message: 'Credencial eliminada correctamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'CREDENTIALS_NOT_FOUND') {
        throw new NotFoundException('Credencial no encontrada');
      }
      throw err;
    }
  }

  @Get()
  async list(@Query() query: QueryCredentialsDto) {
    const result = await this.listUseCase.execute(query);
    return {
      data: result.data.map((entity) => toSafeResponse(entity)),
      message: 'Credenciales obtenidas exitosamente',
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
      throw new NotFoundException('Credencial no encontrada');
    }
    return {
      data: toSafeResponse(entity),
      message: 'Credencial encontrada correctamente',
    };
  }
}
