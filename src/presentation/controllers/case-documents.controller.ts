import {Body,Delete,Get,NotFoundException,Param,ParseIntPipe,Post,Put,Query, ConflictException,Controller,} from '@nestjs/common';
import { CreateCaseDocumentsDto } from '../../application/dto/case-documents/create-case-documents.dto';
import { QueryCaseDocumentsDto } from '../../application/dto/case-documents/query-case-documents.dto';
import { UpdateCaseDocumentsDto } from '../../application/dto/case-documents/update-case-documents.dto';
import { CreateCaseDocumentsUseCase } from '../../application/use-cases/case-documents/create-case-documents.use-case';
import { DeleteCaseDocumentsUseCase } from '../../application/use-cases/case-documents/delete-case-documents.use-case';
import { GetCaseDocumentsByIdUseCase } from '../../application/use-cases/case-documents/get-case-documents-by-id.use-case';
import { ListCaseDocumentsByCaseUseCase } from '../../application/use-cases/case-documents/list-case-documents-by-case.use-case';
import { ListCaseDocumentsUseCase } from '../../application/use-cases/case-documents/list-case-documents.use-case';
import { UpdateCaseDocumentsUseCase } from '../../application/use-cases/case-documents/update-case-documents.use-case';
import { CaseDocumentsWithRelations } from '../../domain/repositories/case-documents.repository';

@Controller('case-documents')
export class CaseDocumentsController {
  constructor(
    private readonly createUseCase: CreateCaseDocumentsUseCase,
    private readonly updateUseCase: UpdateCaseDocumentsUseCase,
    private readonly deleteUseCase: DeleteCaseDocumentsUseCase,
    private readonly getByIdUseCase: GetCaseDocumentsByIdUseCase,
    private readonly listUseCase: ListCaseDocumentsUseCase,
    private readonly listByCaseUseCase: ListCaseDocumentsByCaseUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateCaseDocumentsDto) {
    try {
      const data = await this.createUseCase.execute(dto);
      return {
        data: this.toResponse(data),
        message: 'Documento asociado al caso exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'CASE_NOT_FOUND') {
        throw new NotFoundException('Caso no encontrado');
      }
      if (err instanceof Error && err.message === 'DOCUMENT_NOT_FOUND') {
        throw new NotFoundException('Documento no encontrado');
      }
      if (err instanceof Error && err.message === 'CASE_DOCUMENTS_DUPLICATE') {
        throw new ConflictException(
          'Este documento ya está asociado a este caso',
        );
      }
      throw err;
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) idCaseDocuments: number,
    @Body() dto: UpdateCaseDocumentsDto,
  ) {
    try {
      const data = await this.updateUseCase.execute(idCaseDocuments, dto);
      return {
        data: this.toResponse(data),
        message: 'Documento del caso actualizado exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'CASE_DOCUMENTS_NOT_FOUND') {
        throw new NotFoundException(
          'Documento del caso no encontrado',
        );
      }
      if (err instanceof Error && err.message === 'DOCUMENT_NOT_FOUND') {
        throw new NotFoundException('Documento del caso no encontrado');
      }
      if (err instanceof Error && err.message === 'CASE_DOCUMENTS_DUPLICATE') {
        throw new ConflictException(
          'Este documento ya está asociado a este caso',
        );
      }
      throw err;
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) idCaseDocuments: number) {
    try {
      await this.deleteUseCase.execute(idCaseDocuments);
      return {
        message: 'Documento del caso eliminado exitosamente',
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'CASE_DOCUMENTS_NOT_FOUND') {
        throw new NotFoundException(
          'Documento del caso no encontrado',
        );
      }
      throw err;
    }
  }

  @Get()
  async list(@Query() query: QueryCaseDocumentsDto) {
    const result = await this.listUseCase.execute(query);
    return {
      message: 'Asociaciones caso-documento obtenidas exitosamente',
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

  @Get('by-case/:idCase')
  async listByCase(
    @Param('idCase', ParseIntPipe) idCase: number,
    @Query() query: QueryCaseDocumentsDto,
  ) {
    try {
      const result = await this.listByCaseUseCase.execute({
        idCase,
        page: query.page,
        pageSize: query.pageSize,
      });
      return {
        message:
          'Documentos de soporte asociados al caso obtenidos exitosamente',
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
      if (err instanceof Error && err.message === 'CASE_NOT_FOUND') {
        throw new NotFoundException('Caso no encontrado');
      }
      throw err;
    }
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) idCaseDocuments: number) {
    const entity = await this.getByIdUseCase.execute(idCaseDocuments);
    if (!entity) {
      throw new NotFoundException(
        ' Documento del caso no encontrado',
      );
    }
    return {
      data: this.toResponse(entity),
      message: 'Documento del caso encontrado exitosamente',
    };
  }

  private toResponse(entity: CaseDocumentsWithRelations) {
    return {
      idCaseDocuments: entity.idCaseDocuments,
      idCase: entity.idCase,
      idDocument: entity.idDocument,
      caseRecord: entity.caseRecord,
      document: entity.document,
    };
  }
}
