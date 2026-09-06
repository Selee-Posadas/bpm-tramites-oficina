import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  IDocumentoTramiteRepository,
  DOCUMENTO_TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/documento-tramite.repository.interface';
import {
  ITramiteRepository,
  TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/tramite.repository.interface';
import { DocumentoTramite } from '../../domain/entities/documento-tramite.entity';
import { AdjuntarDocumentoDto } from '../../dto/adjuntar-documento.dto';
import { AnyAuthGuard } from '../../../auth/infrastructure/guards/any-auth.guard';
import { TramiteOwnershipGuard } from '../../../auth/infrastructure/guards/tramite-ownership.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/domain/auth-user.interface';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';
import * as crypto from 'crypto';

@Controller('tramites/:id/documentos')
@UseGuards(AnyAuthGuard, TramiteOwnershipGuard)
export class DocumentosController {
  constructor(
    @Inject(DOCUMENTO_TRAMITE_REPOSITORY_TOKEN)
    private readonly documentoRepository: IDocumentoTramiteRepository,
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
  ) {}

  @Get()
  async findByTramiteId(@Param('id') id: string) {
    const documentos = await this.documentoRepository.findByTramiteId(id);
    return documentos.map((d) => ({
      id: d.id,
      tramiteId: d.tramiteId,
      nombreArchivo: d.nombreArchivo,
      mimeType: d.mimeType,
      size: d.size,
      storageKey: d.storageKey,
      subidoPorTipo: d.subidoPorTipo,
      subidoPorId: d.subidoPorId,
      fechaCarga: d.fechaCarga,
    }));
  }

  @Post()
  async create(
    @Param('id') id: string,
    @Body() dto: AdjuntarDocumentoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const tramite = await this.tramiteRepository.findById(id);
    if (!tramite) {
      throw new NotFoundException(`Trámite con ID ${id} no encontrado`);
    }

    const documento = new DocumentoTramite({
      id: crypto.randomUUID(),
      tramiteId: id,
      nombreArchivo: dto.nombreArchivo,
      mimeType: dto.mimeType,
      size: dto.size,
      storageKey: dto.storageKey,
      subidoPorTipo: user.tipo,
      subidoPorId: user.id,
      fechaCarga: new Date(),
    });

    const saved = await this.documentoRepository.save(documento);

    return {
      id: saved.id,
      tramiteId: saved.tramiteId,
      nombreArchivo: saved.nombreArchivo,
      mimeType: saved.mimeType,
      size: saved.size,
      storageKey: saved.storageKey,
      subidoPorTipo: saved.subidoPorTipo,
      subidoPorId: saved.subidoPorId,
      fechaCarga: saved.fechaCarga,
    };
  }

  @Delete(':documentoId')
  async delete(
    @Param('id') id: string,
    @Param('documentoId') documentoId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const doc = await this.documentoRepository.findById(documentoId);
    if (!doc || doc.tramiteId !== id) {
      throw new NotFoundException(`Documento con ID ${documentoId} no encontrado`);
    }

    const esPropietario = doc.subidoPorId === user.id;
    const esAdmin = user.rolInterno === RolInterno.ADMIN;

    if (!esPropietario && !esAdmin) {
      throw new ForbiddenException(
        'No tiene permisos para eliminar este documento',
      );
    }

    await this.documentoRepository.delete(documentoId);
    return { message: 'Documento eliminado con éxito' };
  }
}
