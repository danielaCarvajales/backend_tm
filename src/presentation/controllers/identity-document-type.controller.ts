import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { CreateIdentityDocumentTypeDto } from '../../application/dto/identity-document-type/create-identity-document-type.dto';
import { QueryIdentityDocumentTypeDto } from '../../application/dto/identity-document-type/query-identity-document-type.dto';
import { UpdateIdentityDocumentTypeDto } from '../../application/dto/identity-document-type/update-identity-document-type.dto';
import { CreateIdentityDocumentTypeUseCase } from '../../application/use-cases/identity-document-type/create-identity-document-type.use-case';
import { DeleteIdentityDocumentTypeUseCase } from '../../application/use-cases/identity-document-type/delete-identity-document-type.use-case';
import { GetIdentityDocumentTypeByIdUseCase } from '../../application/use-cases/identity-document-type/get-identity-document-type-by-id.use-case';
import { ListIdentityDocumentTypesUseCase } from '../../application/use-cases/identity-document-type/list-identity-document-types.use-case';
import { UpdateIdentityDocumentTypeUseCase } from '../../application/use-cases/identity-document-type/update-identity-document-type.use-case';
import { Public } from 'src/infrastructure/auth/decorators/public.decorator';

@Controller('identity-document-types')
export class IdentityDocumentTypeController {
  constructor(
    private readonly createUseCase: CreateIdentityDocumentTypeUseCase,
    private readonly updateUseCase: UpdateIdentityDocumentTypeUseCase,
    private readonly deleteUseCase: DeleteIdentityDocumentTypeUseCase,
    private readonly getByIdUseCase: GetIdentityDocumentTypeByIdUseCase,
    private readonly listUseCase: ListIdentityDocumentTypesUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateIdentityDocumentTypeDto) {
    const entity = await this.createUseCase.execute(dto);
    return {
      data: entity,
      message: 'Documento de identificación creado correctamente',
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) idTypeIdentificationDocument: number,
    @Body() dto: UpdateIdentityDocumentTypeDto,
  ) {
    try {
      const entity = await this.updateUseCase.execute(idTypeIdentificationDocument, dto);
      return {
        data: entity,
        message: 'Documento de identificación actualizado correctamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'IDENTITY_DOCUMENT_TYPE_NOT_FOUND') {
        throw new NotFoundException('Identity document type not found');
      }
      throw err;
    }
  }

  @Delete(':id')
  @Public()
  async delete(@Param('id', ParseIntPipe) idTypeIdentificationDocument: number) {
    try {
      await this.deleteUseCase.execute(idTypeIdentificationDocument);
      return {
        message: 'Documento de identificación eliminado correctamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'IDENTITY_DOCUMENT_TYPE_NOT_FOUND') {
        throw new NotFoundException('Identity document type not found');
      }
      throw err;
    }
  }

  @Get()
  async list(@Query() query: QueryIdentityDocumentTypeDto) {
    const result = await this.listUseCase.execute(query);
    return {
      message: 'Tipos de documento de identificación obtenidos exitosamente', 
      data: result.data.map((entity) => ({
        idTypeIdentificationDocument: entity.idTypeIdentificationDocument,
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
  async getById(@Param('id', ParseIntPipe) idTypeIdentificationDocument: number) {
    const entity = await this.getByIdUseCase.execute(idTypeIdentificationDocument);
    
    if (!entity) {
      throw new NotFoundException('Identity document type not found');
    }
    return {
      data: entity,
      message: 'Documento de identificación encontrado correctamente',
    };
  }
}
