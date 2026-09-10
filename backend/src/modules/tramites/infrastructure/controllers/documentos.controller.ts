import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdjuntarDocumentoUseCase } from '../../application/use-cases/adjuntar-documento.use-case';
import { ListarDocumentosUseCase } from '../../application/use-cases/listar-documentos.use-case';
import { ObtenerDocumentoUseCase } from '../../application/use-cases/obtener-documento.use-case';
import { EliminarDocumentoUseCase } from '../../application/use-cases/eliminar-documento.use-case';
import { AdjuntarDocumentoDto } from '../../dto/adjuntar-documento.dto';
import { AnyAuthGuard } from '../../../auth/infrastructure/guards/any-auth.guard';
import { TramiteOwnershipGuard } from '../../../auth/infrastructure/guards/tramite-ownership.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/domain/auth-user.interface';
import { TramiteResponseMapper } from '../../application/mappers/tramite-response.mapper';

@Controller('tramites/:id/documentos')
@UseGuards(AnyAuthGuard, TramiteOwnershipGuard)
export class DocumentosController {
  constructor(
    private readonly adjuntarDocumentoUseCase: AdjuntarDocumentoUseCase,
    private readonly listarDocumentosUseCase: ListarDocumentosUseCase,
    private readonly obtenerDocumentoUseCase: ObtenerDocumentoUseCase,
    private readonly eliminarDocumentoUseCase: EliminarDocumentoUseCase,
  ) {}

  @Get()
  async findByTramiteId(@Param('id') id: string) {
    const docs = await this.listarDocumentosUseCase.execute(id);
    return docs.map(TramiteResponseMapper.toDocumentoDto);
  }

  @Get(':documentoId')
  async findById(@Param('id') id: string, @Param('documentoId') documentoId: string) {
    const doc = await this.obtenerDocumentoUseCase.execute({
      documentoId,
      tramiteId: id,
    });
    return TramiteResponseMapper.toDocumentoDto(doc);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('id') id: string,
    @Body() dto: AdjuntarDocumentoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const doc = await this.adjuntarDocumentoUseCase.execute({
      tramiteId: id,
      nombreArchivo: dto.nombreArchivo,
      mimeType: dto.mimeType,
      size: dto.size,
      storageKey: dto.storageKey,
      subidoPorTipo: user.tipo,
      subidoPorId: user.id,
    });
    return TramiteResponseMapper.toDocumentoDto(doc);
  }

  @Delete(':documentoId')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id') id: string,
    @Param('documentoId') documentoId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.eliminarDocumentoUseCase.execute({
      documentoId,
      tramiteId: id,
      usuarioId: user.id,
      rolInterno: user.rolInterno,
    });
    return { message: 'Documento eliminado con éxito' };
  }
}
