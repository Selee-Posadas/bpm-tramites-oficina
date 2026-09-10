export type EstadoTramite =
  | 'BORRADOR'
  | 'INGRESADO'
  | 'EN_REVISION'
  | 'OBSERVADO'
  | 'DERIVADO'
  | 'ESPERANDO_EXTERNO'
  | 'ESPERANDO_INTERNO'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'CERRADO'
  | 'CANCELADO';

export interface EstadoBadgeProps {
  estado: EstadoTramite | string;
  size?: 'small' | 'medium';
}

export type PrioridadTramite = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export interface PrioridadBadgeProps {
  prioridad: PrioridadTramite | string;
  size?: 'small' | 'medium';
}

export interface SlaInfoProps {
  vencido: boolean;
  horasRestantes: number;
  porcentajeConsumido: number;
  fechaLimite?: Date | string;
}

export interface SlaBadgeProps {
  sla: SlaInfoProps;
  showProgress?: boolean;
}
