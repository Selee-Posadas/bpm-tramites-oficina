import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TiposTramiteModule } from '../tipos-tramite/tipos-tramite.module';
import { AreasModule } from '../areas/areas.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

// Repositories
import { TRAMITE_REPOSITORY_TOKEN } from './domain/repositories/tramite.repository.interface';
import { PrismaTramiteRepository } from './infrastructure/repositories/prisma-tramite.repository';
import { MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN } from './domain/repositories/movimiento-tramite.repository.interface';
import { PrismaMovimientoTramiteRepository } from './infrastructure/repositories/prisma-movimiento-tramite.repository';
import { COMENTARIO_TRAMITE_REPOSITORY_TOKEN } from './domain/repositories/comentario-tramite.repository.interface';
import { PrismaComentarioTramiteRepository } from './infrastructure/repositories/prisma-comentario-tramite.repository';
import { DOCUMENTO_TRAMITE_REPOSITORY_TOKEN } from './domain/repositories/documento-tramite.repository.interface';
import { PrismaDocumentoTramiteRepository } from './infrastructure/repositories/prisma-documento-tramite.repository';

// Use Cases
import { CrearTramiteUseCase } from './application/use-cases/crear-tramite.use-case';
import { IngresarTramiteUseCase } from './application/use-cases/ingresar-tramite.use-case';
import { TomarTramiteUseCase } from './application/use-cases/tomar-tramite.use-case';
import { AsignarTramiteUseCase } from './application/use-cases/asignar-tramite.use-case';
import { DerivarTramiteUseCase } from './application/use-cases/derivar-tramite.use-case';
import { ObservarTramiteUseCase } from './application/use-cases/observar-tramite.use-case';
import { ResponderObservacionUseCase } from './application/use-cases/responder-observacion.use-case';
import { SolicitarIntervencionExternaUseCase } from './application/use-cases/solicitar-intervencion-externa.use-case';
import { ResponderIntervencionExternaUseCase } from './application/use-cases/responder-intervencion-externa.use-case';
import { AprobarTramiteUseCase } from './application/use-cases/aprobar-tramite.use-case';
import { RechazarTramiteUseCase } from './application/use-cases/rechazar-tramite.use-case';
import { CerrarTramiteUseCase } from './application/use-cases/cerrar-tramite.use-case';
import { CancelarTramiteUseCase } from './application/use-cases/cancelar-tramite.use-case';
import { ObtenerTramiteUseCase } from './application/use-cases/obtener-tramite.use-case';

// Controllers
import { TramitesController } from './infrastructure/controllers/tramites.controller';
import { WorkflowController } from './infrastructure/controllers/workflow.controller';
import { ComentariosController } from './infrastructure/controllers/comentarios.controller';
import { DocumentosController } from './infrastructure/controllers/documentos.controller';
import { DashboardController } from './infrastructure/controllers/dashboard.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TiposTramiteModule,
    AreasModule,
    UsuariosModule,
  ],
  controllers: [
    TramitesController,
    WorkflowController,
    ComentariosController,
    DocumentosController,
    DashboardController,
  ],
  providers: [
    {
      provide: TRAMITE_REPOSITORY_TOKEN,
      useClass: PrismaTramiteRepository,
    },
    {
      provide: MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN,
      useClass: PrismaMovimientoTramiteRepository,
    },
    {
      provide: COMENTARIO_TRAMITE_REPOSITORY_TOKEN,
      useClass: PrismaComentarioTramiteRepository,
    },
    {
      provide: DOCUMENTO_TRAMITE_REPOSITORY_TOKEN,
      useClass: PrismaDocumentoTramiteRepository,
    },
    CrearTramiteUseCase,
    IngresarTramiteUseCase,
    TomarTramiteUseCase,
    AsignarTramiteUseCase,
    DerivarTramiteUseCase,
    ObservarTramiteUseCase,
    ResponderObservacionUseCase,
    SolicitarIntervencionExternaUseCase,
    ResponderIntervencionExternaUseCase,
    AprobarTramiteUseCase,
    RechazarTramiteUseCase,
    CerrarTramiteUseCase,
    CancelarTramiteUseCase,
    ObtenerTramiteUseCase,
  ],
  exports: [
    TRAMITE_REPOSITORY_TOKEN,
    MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN,
    COMENTARIO_TRAMITE_REPOSITORY_TOKEN,
    DOCUMENTO_TRAMITE_REPOSITORY_TOKEN,
  ],
})
export class TramitesModule {}
