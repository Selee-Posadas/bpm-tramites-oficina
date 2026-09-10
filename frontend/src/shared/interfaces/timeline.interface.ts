export interface TimelineMovimientoItem {
  id: string;
  estadoAnterior?: string | null;
  estadoNuevo: string;
  usuarioTipo: string;
  usuarioId: string;
  accion: string;
  comentario?: string | null;
  fecha: Date | string;
}

export interface TramiteTimelineProps {
  movimientos: TimelineMovimientoItem[];
}
