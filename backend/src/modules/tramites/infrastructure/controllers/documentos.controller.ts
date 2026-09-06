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
import { EliminarDocumentoUseCase } from '../../application/use-cases/eliminar-documento.use-case';
import { AdjuntarDocumentoDto } from '../../dto/adjuntar-documento.dto';
import { AnyAuthGuard } from '../../../auth/infrastructure/guards/any-auth.guard';
import { TramiteOwnershipGuard } from '../../../auth/infrastructure/guards/tramite-ownership.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/domain/auth-user.interface';

@Controller('tramites/:id/documentos')
@UseGuards(AnyAuthGuard, TramiteOwnershipGuard)
export class DocumentosController {
  constructor(
    private readonly adjuntarDocumentoUseCase: AdjuntarDocumentoUseCase,
    private readonly listarDocumentosUseCase: ListarDocumentosUseCase,
    private readonly eliminarDocumentoUseCase: EliminarDocumentoUseCase,
  ) {}

  @Get()
  async findByTramiteId(@Param('id') id: string) {
    return await this.listarDocumentosUseCase.execute(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('id') id: string,
    @Body() dto: AdjuntarDocumentoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.adjuntarDocumentoUseCase.execute({
      tramiteId: id,
      nombreArchivo: dto.nombreArchivo,
      mimeType: dto.mimeType,
      size: dto.size,
      storageKey: dto.storageKey,
      subidoPorTipo: user.tipo,
      subidoPorId: user.id,
    });
  }

  @Delete(':documentoId')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id') id: string,
    @Param('documentoId') documentoId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.eliminarDocumentoUseCase.execute({
      documentoId,
      tramiteId: id,
      usuarioId: user.id,
      rolInterno: user.rolInterno,
    });
  }
}
