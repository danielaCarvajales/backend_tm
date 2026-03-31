import {Body,ConflictException,Controller,Delete,Get,NotFoundException,Param,ParseIntPipe,Post,Put,Query} from '@nestjs/common';
import { CreatePersonDocumentsDto } from '../../application/dto/person-documents/create-person-documents.dto';
import { QueryPersonDocumentsDto } from '../../application/dto/person-documents/query-person-documents.dto';
import { UpdatePersonDocumentsDto } from '../../application/dto/person-documents/update-person-documents.dto';
import { CreatePersonDocumentsUseCase } from '../../application/use-cases/person-documents/create-person-documents.use-case';
import { DeletePersonDocumentsUseCase } from '../../application/use-cases/person-documents/delete-person-documents.use-case';
import { GetPersonDocumentsByIdUseCase } from '../../application/use-cases/person-documents/get-person-documents-by-id.use-case';
import { ListPersonDocumentsByPersonUseCase } from '../../application/use-cases/person-documents/list-person-documents-by-person.use-case';
import { ListPersonDocumentsUseCase } from '../../application/use-cases/person-documents/list-person-documents.use-case';
import { UpdatePersonDocumentsUseCase } from '../../application/use-cases/person-documents/update-person-documents.use-case';
import { PersonDocumentsWithRelations } from '../../domain/repositories/person-documents.repository';

@Controller('person-documents')
export class PersonDocumentsController {
  constructor(
    private readonly createUseCase: CreatePersonDocumentsUseCase,
    private readonly updateUseCase: UpdatePersonDocumentsUseCase,
    private readonly deleteUseCase: DeletePersonDocumentsUseCase,
    private readonly getByIdUseCase: GetPersonDocumentsByIdUseCase,
    private readonly listUseCase: ListPersonDocumentsUseCase,
    private readonly listByPersonUseCase: ListPersonDocumentsByPersonUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreatePersonDocumentsDto) {
    try {
      const data = await this.createUseCase.execute(dto);
      return {
        data: this.toResponse(data),
        message: 'Documento de soporte asociado a la persona exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'PERSON_NOT_FOUND') {
        throw new NotFoundException('Persona no encontrada');
      }
      if (err instanceof Error && err.message === 'DOCUMENT_NOT_FOUND') {
        throw new NotFoundException('Documento no encontrado');
      }
      if (err instanceof Error && err.message === 'PERSON_DOCUMENTS_DUPLICATE') {
        throw new ConflictException(
          'Este documento ya está registrado para esta persona',
        );
      }
      throw err;
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) idPersonDocuments: number,
    @Body() dto: UpdatePersonDocumentsDto,
  ) {
    try {
      const data = await this.updateUseCase.execute(idPersonDocuments, dto);
      return {
        data: this.toResponse(data),
        message: 'Se actualizó la relación entre la persona y el documento exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'PERSON_DOCUMENTS_NOT_FOUND') {
        throw new NotFoundException('No se encontraron documentos de la persona');
      }
      if (err instanceof Error && err.message === 'DOCUMENT_NOT_FOUND') {
        throw new NotFoundException('Documento no encontrado');
      }
      if (err instanceof Error && err.message === 'PERSON_DOCUMENTS_DUPLICATE') {
        throw new ConflictException(
          'Ya existe una relación entre esta persona y este documento',
        );
      }
      throw err;
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) idPersonDocuments: number) {
    try {
      await this.deleteUseCase.execute(idPersonDocuments);
      return {
        message: 'Se eliminaron los documentos de la persona exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'PERSON_DOCUMENTS_NOT_FOUND') {
        throw new NotFoundException('No existen documentos asociados a esta persona');
      }
      throw err;
    }
  }

  @Get()
  async list(@Query() query: QueryPersonDocumentsDto) {
    const result = await this.listUseCase.execute(query);
    return {
      message: 'Se obtuvieron los documentos de la persona exitosamente',
      data: result.data.map((entity) => this.toResponse(entity)),
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

  @Get('by-person/:idPerson')
  async listByPerson(
    @Param('idPerson', ParseIntPipe) idPerson: number,
    @Query() query: QueryPersonDocumentsDto,
  ) {
    try {
      const result = await this.listByPersonUseCase.execute({
        idPerson,
        page: query.page,
        pageSize: query.pageSize,
      });
      return {
        message:
          'Documentos de soporte asociados a la persona obtenidos exitosamente',
        data: result.data.map((entity) => this.toResponse(entity)),
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
      if (err instanceof Error && err.message === 'PERSON_NOT_FOUND') {
        throw new NotFoundException('Persona no encontrada');
      }
      throw err;
    }
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) idPersonDocuments: number) {
    const entity = await this.getByIdUseCase.execute(idPersonDocuments);
    if (!entity) {
      throw new NotFoundException('No se encontraron documentos de la persona');
    }
    return {
      data: this.toResponse(entity),
      message: 'Se obtuvo el documento de la persona exitosamente',
    };
  }

  private toResponse(entity: PersonDocumentsWithRelations) {
    return {
      idPersonDocuments: entity.idPersonDocuments,
      idPerson: entity.idPerson,
      idDocument: entity.idDocument,
      person: entity.person,
      document: entity.document,
    };
  }
}
