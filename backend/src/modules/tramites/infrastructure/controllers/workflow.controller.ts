import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IngresarTramiteUseCase } from '../../application/use-cases/ingresar-tramite.use-case';
import { TomarTramiteUseCase } from '../../application/use-cases/tomar-tramite.use-case';
import { AsignarTramiteUseCase } from '../../application/use-cases/asignar-tramite.use-case';
import { DerivarTramiteUseCase } from '../../application/use-cases/derivar-tramite.use-case';
import { ObservarTramiteUseCase } from '../../application/use-cases/observar-tramite.use-case';
import { ResponderObservacionUseCase } from '../../application/use-cases/responder-observacion.use-case';
import { SolicitarIntervencionExternaUseCase } from '../../application/use-cases/solicitar-intervencion-externa.use-case';
import { ResponderIntervencionExternaUseCase } from '../../application/use-cases/responder-intervencion-externa.use-case';
import { AprobarTramiteUseCase } from '../../application/use-cases/aprobar-tramite.use-case';
import { RechazarTramiteUseCase } from '../../application/use-cases/rechazar-tramite.use-case';
import { CerrarTramiteUseCase } from '../../application/use-cases/cerrar-tramite.use-case';
import { CancelarTramiteUseCase } from '../../application/use-cases/cancelar-tramite.use-case';

import {
  AsignarTramiteDto,
  DerivarTramiteDto,
  ObservarTramiteDto,
  ResponderObservacionDto,
  SolicitarIntervencionExternaDto,
  ResponderIntervencionExternaDto,
  AprobarTramiteDto,
  RechazarTramiteDto,
  CerrarTramiteDto,
  CancelarTramiteDto,
} from '../../dto/transiciones-workflow.dto';

import { InternalAuthGuard } from '../../../auth/infrastructure/guards/internal-auth.guard';
import { ExternalAuthGuard } from '../../../auth/infrastructure/guards/external-auth.guard';
import { AnyAuthGuard } from '../../../auth/infrastructure/guards/any-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { TramiteOwnershipGuard } from '../../../auth/infrastructure/guards/tramite-ownership.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/domain/auth-user.interface';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';
import { WorkflowContext } from '../../domain/workflow/workflow.interface';
import { TramiteResponseMapper } from '../../application/mappers/tramite-response.mapper';

@Controller('tramites/:id')
export class WorkflowController {
  constructor(
    private readonly ingresarTramiteUseCase: IngresarTramiteUseCase,
    private readonly tomarTramiteUseCase: TomarTramiteUseCase,
    private readonly asignarTramiteUseCase: AsignarTramiteUseCase,
    private readonly derivarTramiteUseCase: DerivarTramiteUseCase,
    private readonly observarTramiteUseCase: ObservarTramiteUseCase,
    private readonly responderObservacionUseCase: ResponderObservacionUseCase,
    private readonly solicitarIntervencionExternaUseCase: SolicitarIntervencionExternaUseCase,
    private readonly responderIntervencionExternaUseCase: ResponderIntervencionExternaUseCase,
    private readonly aprobarTramiteUseCase: AprobarTramiteUseCase,
    private readonly rechazarTramiteUseCase: RechazarTramiteUseCase,
    private readonly cerrarTramiteUseCase: CerrarTramiteUseCase,
    private readonly cancelarTramiteUseCase: CancelarTramiteUseCase,
  ) {}

  private createContexto(user: AuthenticatedUser, motivo?: string, areaDestinoId?: string): WorkflowContext {
    return {
      usuarioTipo: user.tipo,
      usuarioId: user.id,
      rolInterno: user.rolInterno,
      areaUsuarioId: user.areaId,
      motivo,
      areaDestinoId,
    };
  }

  @Post('ingresar')
  @UseGuards(AnyAuthGuard, TramiteOwnershipGuard)
  @HttpCode(HttpStatus.OK)
  async ingresar(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const contexto = this.createContexto(user);
    const tramite = await this.ingresarTramiteUseCase.execute({
      tramiteId: id,
      contexto,
    });
    return TramiteResponseMapper.toTransitionDto(tramite);
  }

  @Post('tomar')
  @UseGuards(InternalAuthGuard, RolesGuard)
  @Roles(RolInterno.OPERADOR, RolInterno.SUPERVISOR, RolInterno.ADMIN)
  @HttpCode(HttpStatus.OK)
  async tomar(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const contexto = this.createContexto(user);
    const tramite = await this.tomarTramiteUseCase.execute({
      tramiteId: id,
      contexto,
    });
    return TramiteResponseMapper.toTransitionDto(tramite);
  }

  @Post('asignar')
  @UseGuards(InternalAuthGuard, RolesGuard)
  @Roles(RolInterno.SUPERVISOR, RolInterno.ADMIN)
  @HttpCode(HttpStatus.OK)
  async asignar(
    @Param('id') id: string,
    @Body() dto: AsignarTramiteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const contexto = this.createContexto(user);
    const tramite = await this.asignarTramiteUseCase.execute({
      tramiteId: id,
      nuevoOperadorId: dto.operadorId,
      contexto,
    });
    return TramiteResponseMapper.toTransitionDto(tramite);
  }

  @Post('derivar')
  @UseGuards(InternalAuthGuard, RolesGuard)
  @Roles(RolInterno.OPERADOR, RolInterno.SUPERVISOR, RolInterno.ADMIN)
  @HttpCode(HttpStatus.OK)
  async derivar(
    @Param('id') id: string,
    @Body() dto: DerivarTramiteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const contexto = this.createContexto(user, dto.motivo, dto.areaDestinoId);
    const tramite = await this.derivarTramiteUseCase.execute({
      tramiteId: id,
      areaDestinoId: dto.areaDestinoId,
      motivo: dto.motivo,
      contexto,
    });
    return TramiteResponseMapper.toTransitionDto(tramite);
  }

  @Post('observar')
  @UseGuards(InternalAuthGuard, RolesGuard)
  @Roles(RolInterno.OPERADOR, RolInterno.SUPERVISOR, RolInterno.ADMIN)
  @HttpCode(HttpStatus.OK)
  async observar(
    @Param('id') id: string,
    @Body() dto: ObservarTramiteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const contexto = this.createContexto(user, dto.motivo);
    const tramite = await this.observarTramiteUseCase.execute({
      tramiteId: id,
      motivo: dto.motivo,
      contexto,
    });
    return TramiteResponseMapper.toTransitionDto(tramite);
  }

  @Post('responder-observacion')
  @UseGuards(ExternalAuthGuard, TramiteOwnershipGuard)
  @HttpCode(HttpStatus.OK)
  async responderObservacion(
    @Param('id') id: string,
    @Body() dto: ResponderObservacionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const contexto = this.createContexto(user, dto.motivo || dto.respuesta);
    const tramite = await this.responderObservacionUseCase.execute({
      tramiteId: id,
      respuesta: dto.respuesta,
      contexto,
    });
    return TramiteResponseMapper.toTransitionDto(tramite);
  }

  @Post('solicitar-intervencion-externa')
  @UseGuards(InternalAuthGuard, RolesGuard)
  @Roles(RolInterno.OPERADOR, RolInterno.SUPERVISOR, RolInterno.ADMIN)
  @HttpCode(HttpStatus.OK)
  async solicitarIntervencionExterna(
    @Param('id') id: string,
    @Body() dto: SolicitarIntervencionExternaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const contexto = this.createContexto(user, dto.motivo);
    const tramite = await this.solicitarIntervencionExternaUseCase.execute({
      tramiteId: id,
      motivo: dto.motivo,
      contexto,
    });
    return TramiteResponseMapper.toTransitionDto(tramite);
  }

  @Post('responder-intervencion-externa')
  @UseGuards(ExternalAuthGuard, TramiteOwnershipGuard)
  @HttpCode(HttpStatus.OK)
  async responderIntervencionExterna(
    @Param('id') id: string,
    @Body() dto: ResponderIntervencionExternaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const contexto = this.createContexto(user, dto.motivo || dto.respuesta);
    const tramite = await this.responderIntervencionExternaUseCase.execute({
      tramiteId: id,
      respuesta: dto.respuesta,
      contexto,
    });
    return TramiteResponseMapper.toTransitionDto(tramite);
  }

  @Post('aprobar')
  @UseGuards(InternalAuthGuard, RolesGuard)
  @Roles(RolInterno.OPERADOR, RolInterno.SUPERVISOR, RolInterno.ADMIN)
  @HttpCode(HttpStatus.OK)
  async aprobar(
    @Param('id') id: string,
    @Body() dto: AprobarTramiteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const contexto = this.createContexto(user, dto.motivo);
    const tramite = await this.aprobarTramiteUseCase.execute({
      tramiteId: id,
      motivo: dto.motivo,
      contexto,
    });
    return TramiteResponseMapper.toTransitionDto(tramite);
  }

  @Post('rechazar')
  @UseGuards(InternalAuthGuard, RolesGuard)
  @Roles(RolInterno.OPERADOR, RolInterno.SUPERVISOR, RolInterno.ADMIN)
  @HttpCode(HttpStatus.OK)
  async rechazar(
    @Param('id') id: string,
    @Body() dto: RechazarTramiteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const contexto = this.createContexto(user, dto.motivo);
    const tramite = await this.rechazarTramiteUseCase.execute({
      tramiteId: id,
      motivo: dto.motivo,
      contexto,
    });
    return TramiteResponseMapper.toTransitionDto(tramite);
  }

  @Post('cerrar')
  @UseGuards(InternalAuthGuard, RolesGuard)
  @Roles(RolInterno.OPERADOR, RolInterno.SUPERVISOR, RolInterno.ADMIN)
  @HttpCode(HttpStatus.OK)
  async cerrar(
    @Param('id') id: string,
    @Body() dto: CerrarTramiteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const contexto = this.createContexto(user, dto.motivo);
    const tramite = await this.cerrarTramiteUseCase.execute({
      tramiteId: id,
      motivo: dto.motivo,
      contexto,
    });
    return TramiteResponseMapper.toTransitionDto(tramite);
  }

  @Post('cancelar')
  @UseGuards(AnyAuthGuard, TramiteOwnershipGuard)
  @HttpCode(HttpStatus.OK)
  async cancelar(
    @Param('id') id: string,
    @Body() dto: CancelarTramiteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const contexto = this.createContexto(user, dto.motivo);
    const tramite = await this.cancelarTramiteUseCase.execute({
      tramiteId: id,
      motivo: dto.motivo,
      contexto,
    });
    return TramiteResponseMapper.toTransitionDto(tramite);
  }
}
