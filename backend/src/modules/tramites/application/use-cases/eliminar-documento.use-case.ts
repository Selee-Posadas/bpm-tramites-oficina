import { Inject, Injectable } from '@nestjs/common';
import {
  IDocumentoTramiteRepository,
  DOCUMENTO_TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/documento-tramite.repository.interface';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';
import {
  EntityNotFoundException,
  UnauthorizedActionException,
} from '../../../../shared/domain/exceptions/domain.exception';

export interface EliminarDocumentoCommand {
  documentoId: string;
  tramiteId: string;
  usuarioId: string;
  rolInterno?: RolInterno;
}

@Injectable()
export class EliminarDocumentoUseCase {
  constructor(
    @Inject(DOCUMENTO_TRAMITE_REPOSITORY_TOKEN)
    private readonly documentoRepository: IDocumentoTramiteRepository,
  ) {}

  async execute(command: EliminarDocumentoCommand): Promise<void> {
    const doc = await this.documentoRepository.findById(command.documentoId);
    if (!doc || doc.tramiteId !== command.tramiteId) {
      throw new EntityNotFoundException('Documento', command.documentoId);
    }

    const esPropietario = doc.subidoPorId === command.usuarioId;
    const esAdmin = command.rolInterno === RolInterno.ADMIN;

    if (!esPropietario && !esAdmin) {
      throw new UnauthorizedActionException(
        'No tiene permisos para eliminar este documento',
      );
    }

    await this.documentoRepository.delete(command.documentoId);
  }
}
