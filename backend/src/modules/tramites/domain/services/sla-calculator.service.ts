import { Tramite } from '../entities/tramite.entity';

export enum SlaStatus {
  EN_TERMINO = 'EN_TERMINO',
  PROXIMO_A_VENCER = 'PROXIMO_A_VENCER',
  VENCIDO = 'VENCIDO',
  FINALIZADO = 'FINALIZADO',
}

export interface SlaInfo {
  estaVencido: boolean;
  estadoSla: SlaStatus;
  slaHoras: number;
  fechaLimite: Date;
  minutosRestantes: number;
  porcentajeConsumido: number;
}

export class SlaCalculatorService {
  static calcularSla(tramite: Tramite, slaHoras: number, fechaActual: Date = new Date()): SlaInfo {
    const fechaCreacionMs = tramite.fechaCreacion.getTime();
    const duracionTotalMs = slaHoras * 3600 * 1000;
    const fechaLimiteMs = fechaCreacionMs + duracionTotalMs;
    const fechaLimite = new Date(fechaLimiteMs);

    if (
      tramite.estado === 'APROBADO' ||
      tramite.estado === 'RECHAZADO' ||
      tramite.estado === 'CANCELADO' ||
      tramite.estado === 'CERRADO'
    ) {
      const fechaFinMs = tramite.fechaCierre ? tramite.fechaCierre.getTime() : fechaActual.getTime();
      const vencioAntesDeCerrar = fechaFinMs > fechaLimiteMs;
      return {
        estaVencido: vencioAntesDeCerrar,
        estadoSla: SlaStatus.FINALIZADO,
        slaHoras,
        fechaLimite,
        minutosRestantes: Math.floor((fechaLimiteMs - fechaFinMs) / 60000),
        porcentajeConsumido: Math.min(100, Math.round(((fechaFinMs - fechaCreacionMs) / duracionTotalMs) * 100)),
      };
    }

    const tiempoTranscurridoMs = Math.max(0, fechaActual.getTime() - fechaCreacionMs);
    const porcentajeConsumido = Math.round((tiempoTranscurridoMs / duracionTotalMs) * 100);
    const minutosRestantes = Math.floor((fechaLimiteMs - fechaActual.getTime()) / 60000);
    const estaVencido = fechaActual.getTime() > fechaLimiteMs;

    let estadoSla = SlaStatus.EN_TERMINO;
    if (estaVencido) {
      estadoSla = SlaStatus.VENCIDO;
    } else if (porcentajeConsumido >= 80) {
      estadoSla = SlaStatus.PROXIMO_A_VENCER;
    }

    return {
      estaVencido,
      estadoSla,
      slaHoras,
      fechaLimite,
      minutosRestantes,
      porcentajeConsumido,
    };
  }
}
