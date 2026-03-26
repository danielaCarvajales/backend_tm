import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateTypeDocumentDto } from '../../application/dto/type-document/create-type-document.dto';
import { QueryTypeDocumentDto } from '../../application/dto/type-document/query-type-document.dto';
import { UpdateTypeDocumentDto } from '../../application/dto/type-document/update-type-document.dto';
import { CreateTypeDocumentUseCase } from '../../application/use-cases/type-document/create-type-document.use-case';
import { DeleteTypeDocumentUseCase } from '../../application/use-cases/type-document/delete-type-document.use-case';
import { GetTypeDocumentByIdUseCase } from '../../application/use-cases/type-document/get-type-document-by-id.use-case';
import { ListTypeDocumentsUseCase } from '../../application/use-cases/type-document/list-type-documents.use-case';
import { UpdateTypeDocumentUseCase } from '../../application/use-cases/type-document/update-type-document.use-case';

@Controller('type-documents')
export class TypeDocumentController {
  constructor(
    private readonly createUseCase: CreateTypeDocumentUseCase,
    private readonly updateUseCase: UpdateTypeDocumentUseCase,
    private readonly deleteUseCase: DeleteTypeDocumentUseCase,
    private readonly getByIdUseCase: GetTypeDocumentByIdUseCase,
    private readonly listUseCase: ListTypeDocumentsUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateTypeDocumentDto) {
    try {
      const entity = await this.createUseCase.execute(dto);
      return {
        data: {
          idTypeDocument: entity.idTypeDocument,
          nameTypeDocument: entity.nameTypeDocument,
        },
        message: 'Tipo de documento creado exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'TYPE_DOCUMENT_NAME_ALREADY_EXISTS'
      ) {
        throw new ConflictException(
          'Ya existe un tipo de documento con ese nombre',
        );
      }
      throw err;
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) idTypeDocument: number,
    @Body() dto: UpdateTypeDocumentDto,
  ) {
    try {
      const entity = await this.updateUseCase.execute(idTypeDocument, dto);
      return {
        data: {
          idTypeDocument: entity.idTypeDocument,
          nameTypeDocument: entity.nameTypeDocument,
        },
        message: 'Tipo de documento actualizado exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'TYPE_DOCUMENT_NOT_FOUND'
      ) {
        throw new NotFoundException('Tipo de documento no encontrado');
      }
      if (
        err instanceof Error &&
        err.message === 'TYPE_DOCUMENT_NAME_ALREADY_EXISTS'
      ) {
        throw new ConflictException(
          'Ya existe un tipo de documento con ese nombre',
        );
      }
      throw err;
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) idTypeDocument: number) {
    try {
      await this.deleteUseCase.execute(idTypeDocument);
      return {
        message: 'Tipo de documento eliminado exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'TYPE_DOCUMENT_NOT_FOUND'
      ) {
        throw new NotFoundException('Tipo de documento no encontrado');
      }
      if (err instanceof Error && err.message === 'TYPE_DOCUMENT_IN_USE') {
        throw new ConflictException(
          'No se puede eliminar: el tipo de documento está siendo usado por uno o más documentos',
        );
      }
      throw err;
    }
  }

  @Get()
  async list(@Query() query: QueryTypeDocumentDto) {
    const result = await this.listUseCase.execute(query);
    return {
      message: 'Tipos de documento obtenidos exitosamente',
      data: result.data.map((entity) => ({
        idTypeDocument: entity.idTypeDocument,
        nameTypeDocument: entity.nameTypeDocument,
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
  async getById(@Param('id', ParseIntPipe) idTypeDocument: number) {
    const entity = await this.getByIdUseCase.execute(idTypeDocument);
    if (!entity) {
      throw new NotFoundException('Tipo de documento no encontrado');
    }
    return {
      data: {
        idTypeDocument: entity.idTypeDocument,
        nameTypeDocument: entity.nameTypeDocument,
      },
      message: 'Tipo de documento encontrado exitosamente',
    };
  }
}
