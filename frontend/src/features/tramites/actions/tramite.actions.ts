import { httpClient } from '../../../shared/api/httpClient';
import {
  ComentarioResponseDto,
  CreateTramiteRequestDto,
  DocumentoResponseDto,
  ListarTramitesResponseDto,
  TramiteDetalleResponseDto,
  WorkflowTransitionResponseDto,
} from '../interfaces/tramite.api.interface';
import { TramiteAdapter } from '../adapters/tramite.adapter';
import {
  ComentarioItem,
  DocumentoItem,
  TramiteDetalle,
  TramiteFiltros,
  TramiteResumen,
} from '../interfaces/tramite.interface';

export class TramiteActions {
  static async listar(filtros: TramiteFiltros = {}): Promise<{ items: TramiteResumen[]; total: number }> {
    const params: Record<string, string> = {};
    if (filtros.estado) params.estado = filtros.estado;
    if (filtros.areaId) params.areaId = filtros.areaId;
    if (filtros.prioridad) params.prioridad = filtros.prioridad;
    if (filtros.tipoTramiteId) params.tipoTramiteId = filtros.tipoTramiteId;
    if (filtros.soloVencidos) params.soloVencidos = 'true';
    if (filtros.busqueda) params.busqueda = filtros.busqueda;
    if (filtros.skip !== undefined) params.skip = filtros.skip.toString();
    if (filtros.take !== undefined) params.take = filtros.take.toString();

    const response = await httpClient.get<ListarTramitesResponseDto>('/tramites', { params });
    return {
      items: TramiteAdapter.toResumenList(response.data.items),
      total: response.data.total,
    };
  }

  static async obtenerPorId(id: string): Promise<TramiteDetalle> {
    const response = await httpClient.get<TramiteDetalleResponseDto>(`/tramites/${id}`);
    return TramiteAdapter.toDetalle(response.data);
  }

  static async crear(dto: CreateTramiteRequestDto): Promise<{ id: string; numero: string }> {
    const response = await httpClient.post<{ id: string; numero: string }>('/tramites', dto);
    return response.data;
  }

  static async modificarBorrador(id: string, dto: Partial<CreateTramiteRequestDto>): Promise<void> {
    await httpClient.put(`/tramites/${id}`, dto);
  }

  static async eliminarBorrador(id: string): Promise<void> {
    await httpClient.delete(`/tramites/${id}`);
  }

  static async ingresar(id: string): Promise<WorkflowTransitionResponseDto> {
    const response = await httpClient.post<WorkflowTransitionResponseDto>(`/tramites/${id}/ingresar`);
    return response.data;
  }

  static async tomar(id: string): Promise<WorkflowTransitionResponseDto> {
    const response = await httpClient.post<WorkflowTransitionResponseDto>(`/tramites/${id}/tomar`);
    return response.data;
  }

  static async asignar(id: string, operadorId: string, motivo?: string): Promise<WorkflowTransitionResponseDto> {
    const response = await httpClient.post<WorkflowTransitionResponseDto>(`/tramites/${id}/asignar`, {
      operadorId,
      motivo,
    });
    return response.data;
  }

  static async derivar(id: string, areaDestinoId: string, motivo?: string): Promise<WorkflowTransitionResponseDto> {
    const response = await httpClient.post<WorkflowTransitionResponseDto>(`/tramites/${id}/derivar`, {
      areaDestinoId,
      motivo,
    });
    return response.data;
  }

  static async observar(id: string, motivo: string): Promise<WorkflowTransitionResponseDto> {
    const response = await httpClient.post<WorkflowTransitionResponseDto>(`/tramites/${id}/observar`, { motivo });
    return response.data;
  }

  static async responderObservacion(id: string, respuesta: string): Promise<WorkflowTransitionResponseDto> {
    const response = await httpClient.post<WorkflowTransitionResponseDto>(`/tramites/${id}/responder-observacion`, {
      respuesta,
    });
    return response.data;
  }

  static async solicitarIntervencionExterna(id: string, motivo: string): Promise<WorkflowTransitionResponseDto> {
    const response = await httpClient.post<WorkflowTransitionResponseDto>(
      `/tramites/${id}/solicitar-intervencion-externa`,
      { motivo },
    );
    return response.data;
  }

  static async responderIntervencionExterna(id: string, respuesta: string): Promise<WorkflowTransitionResponseDto> {
    const response = await httpClient.post<WorkflowTransitionResponseDto>(
      `/tramites/${id}/responder-intervencion-externa`,
      { respuesta },
    );
    return response.data;
  }

  static async aprobar(id: string, motivo?: string): Promise<WorkflowTransitionResponseDto> {
    const response = await httpClient.post<WorkflowTransitionResponseDto>(`/tramites/${id}/aprobar`, { motivo });
    return response.data;
  }

  static async rechazar(id: string, motivo: string): Promise<WorkflowTransitionResponseDto> {
    const response = await httpClient.post<WorkflowTransitionResponseDto>(`/tramites/${id}/rechazar`, { motivo });
    return response.data;
  }

  static async cerrar(id: string, motivo?: string): Promise<WorkflowTransitionResponseDto> {
    const response = await httpClient.post<WorkflowTransitionResponseDto>(`/tramites/${id}/cerrar`, { motivo });
    return response.data;
  }

  static async cancelar(id: string, motivo: string): Promise<WorkflowTransitionResponseDto> {
    const response = await httpClient.post<WorkflowTransitionResponseDto>(`/tramites/${id}/cancelar`, { motivo });
    return response.data;
  }

  static async listarComentarios(tramiteId: string): Promise<ComentarioItem[]> {
    const response = await httpClient.get<ComentarioResponseDto[]>(`/tramites/${tramiteId}/comentarios`);
    return response.data.map(TramiteAdapter.toComentario);
  }

  static async agregarComentario(
    tramiteId: string,
    mensaje: string,
    visibilidad: 'INTERNA' | 'EXTERNA' | 'TODOS',
  ): Promise<ComentarioItem> {
    const response = await httpClient.post<ComentarioResponseDto>(`/tramites/${tramiteId}/comentarios`, {
      mensaje,
      visibilidad,
    });
    return TramiteAdapter.toComentario(response.data);
  }

  static async listarDocumentos(tramiteId: string): Promise<DocumentoItem[]> {
    const response = await httpClient.get<DocumentoResponseDto[]>(`/tramites/${tramiteId}/documentos`);
    return response.data.map(TramiteAdapter.toDocumento);
  }

  static async adjuntarDocumento(
    tramiteId: string,
    doc: { nombreArchivo: string; mimeType: string; size: number; storageKey: string },
  ): Promise<DocumentoItem> {
    const response = await httpClient.post<DocumentoResponseDto>(`/tramites/${tramiteId}/documentos`, doc);
    return TramiteAdapter.toDocumento(response.data);
  }

  static async eliminarDocumento(tramiteId: string, documentoId: string): Promise<void> {
    await httpClient.delete(`/tramites/${tramiteId}/documentos/${documentoId}`);
  }
}
