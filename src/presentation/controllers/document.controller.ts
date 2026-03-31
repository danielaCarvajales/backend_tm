import {
  BadGatewayException,
  BadRequestException,
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
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateDocumentDto } from '../../application/dto/document/create-document.dto';
import { QueryDocumentDto } from '../../application/dto/document/query-document.dto';
import { UpdateDocumentDto } from '../../application/dto/document/update-document.dto';
import { CreateDocumentUseCase } from '../../application/use-cases/document/create-document.use-case';
import { DeleteDocumentUseCase } from '../../application/use-cases/document/delete-document.use-case';
import { DownloadDocumentFileUseCase } from '../../application/use-cases/document/download-document-file.use-case';
import { GetDocumentByIdUseCase } from '../../application/use-cases/document/get-document-by-id.use-case';
import { ListDocumentsUseCase } from '../../application/use-cases/document/list-documents.use-case';
import { UpdateDocumentUseCase } from '../../application/use-cases/document/update-document.use-case';
import { Document } from '../../domain/entities/document.entity';
import { Roles } from 'src/infrastructure/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/infrastructure/auth/guards/roles.guard';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const uploadStorage = memoryStorage();

const allowedMimePattern =
  /^(application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)|image\/(jpeg|png|gif|webp))$/i;

function documentToResponse(entity: Document) {
  return {
    idDocument: entity.idDocument,
    nameFileDocument: entity.nameFileDocument,
    descriptionDocument: entity.descriptionDocument,
    urlDocument: entity.urlDocument,
    downloadPath:
      entity.idDocument !== undefined
        ? `documents/${entity.idDocument}/download`
        : undefined,
    mimeType: entity.mimeType,
    idTypeDocument: entity.idTypeDocument,
    typeDocument: entity.typeDocument
      ? {
          idTypeDocument: entity.typeDocument.idTypeDocument,
          nameTypeDocument: entity.typeDocument.nameTypeDocument,
        }
      : null,
    createdAtDocument: entity.createdAtDocument,
  };
}

@Controller('documents')
export class DocumentController {
  constructor(
    private readonly createUseCase: CreateDocumentUseCase,
    private readonly updateUseCase: UpdateDocumentUseCase,
    private readonly deleteUseCase: DeleteDocumentUseCase,
    private readonly getByIdUseCase: GetDocumentByIdUseCase,
    private readonly listUseCase: ListDocumentsUseCase,
    private readonly downloadFileUseCase: DownloadDocumentFileUseCase,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: uploadStorage }))
  async create(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: CreateDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException('Se requiere adjuntar un archivo');
    }
    if (file.size > MAX_FILE_BYTES) {
      throw new BadRequestException(
        'El archivo excede el tamaño máximo permitido (10 MB)',
      );
    }
    if (!allowedMimePattern.test(file.mimetype)) {
      throw new BadRequestException('Tipo de archivo no permitido');
    }
    try {
      const entity = await this.createUseCase.execute(dto, file);
      return {
        data: documentToResponse(entity),
        message: 'Documento creado exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'STORAGE_UPLOAD_FAILED'
      ) {
        throw new BadGatewayException(
          'No se pudo subir el archivo al almacenamiento',
        );
      }
      throw err;
    }
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  @UseInterceptors(FileInterceptor('file', { storage: uploadStorage }))
  async update(
    @Param('id', ParseIntPipe) idDocument: number,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UpdateDocumentDto,
  ) {
    if (file) {
      if (file.size > MAX_FILE_BYTES) {
        throw new BadRequestException(
          'El archivo excede el tamaño máximo permitido (10 MB)',
        );
      }
      if (!allowedMimePattern.test(file.mimetype)) {
        throw new BadRequestException('Tipo de archivo no permitido');
      }
    }
    try {
      const entity = await this.updateUseCase.execute(idDocument, dto, file);
      return {
        data: documentToResponse(entity),
        message: 'Documento actualizado exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'DOCUMENT_NOT_FOUND'
      ) {
        throw new NotFoundException('Documento no encontrado');
      }
      throw err;
    }
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async delete(@Param('id', ParseIntPipe) idDocument: number) {
    try {
      await this.deleteUseCase.execute(idDocument);
      return {
        message: 'Documento eliminado exitosamente',
      };
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'DOCUMENT_NOT_FOUND'
      ) {
        throw new NotFoundException('Documento no encontrado');
      }
      if (
        err instanceof Error &&
        err.message === 'DOCUMENT_IN_USE'
      ) {
        throw new ConflictException(
          'No se puede eliminar: el documento está asociado a otros registros',
        );
      }
      if (
        err instanceof Error &&
        err.message === 'STORAGE_DELETE_FAILED'
      ) {
        throw new BadGatewayException(
          'El registro se eliminó pero no se pudo borrar el archivo en el almacenamiento',
        );
      }
      throw err;
    }
  }

  @Get()
  async list(@Query() query: QueryDocumentDto) {
    const result = await this.listUseCase.execute(query);
    return {
      message: 'Documentos obtenidos exitosamente',
      data: result.data.map((entity) => documentToResponse(entity)),
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

  @Get(':id/download')
  async download(@Param('id', ParseIntPipe) idDocument: number) {
    try {
      const { buffer, mimeType, fileName } =
        await this.downloadFileUseCase.execute(idDocument);
      const encodedName = encodeURIComponent(fileName);
      return new StreamableFile(buffer, {
        type: mimeType,
        disposition: `attachment; filename="${encodedName.replace(/"/g, '')}"; filename*=UTF-8''${encodedName}`,
      });
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'DOCUMENT_NOT_FOUND'
      ) {
        throw new NotFoundException('Documento no encontrado');
      }
      if (
        err instanceof Error &&
        err.message === 'STORAGE_DOWNLOAD_FAILED'
      ) {
        throw new BadGatewayException(
          'No se pudo obtener el archivo del almacenamiento',
        );
      }
      throw err;
    }
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) idDocument: number) {
    const entity = await this.getByIdUseCase.execute(idDocument);
    if (!entity) {
      throw new NotFoundException('Documento no encontrado');
    }
    return {
      data: documentToResponse(entity),
      message: 'Documento encontrado exitosamente',
    };
  }
}
