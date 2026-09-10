'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TramiteDetalle } from '../interfaces/tramite.interface';
import { TramiteActions } from '../actions/tramite.actions';
import { useNotification } from '../../../shared/context/NotificationContext';

export function useTramite(id: string) {
  const [tramite, setTramite] = useState<TramiteDetalle | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess } = useNotification();
  const isMountedRef = useRef<boolean>(true);

  const cargar = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await TramiteActions.obtenerPorId(id);
      if (isMountedRef.current) {
        setTramite(data);
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        const msg = err instanceof Error ? err.message : 'Error al cargar trámite';
        setError(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    isMountedRef.current = true;
    cargar();

    return () => {
      isMountedRef.current = false;
    };
  }, [cargar]);

  const ejecutarAccion = async (accionFn: () => Promise<unknown>, mensajeExito: string): Promise<boolean> => {
    setIsActionLoading(true);
    try {
      await accionFn();
      showSuccess(mensajeExito);
      await cargar();
      return true;
    } catch (err: unknown) {
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    tramite,
    isLoading,
    isActionLoading,
    error,
    recargar: cargar,

    ingresar: () => ejecutarAccion(() => TramiteActions.ingresar(id), 'Trámite ingresado correctamente'),
    tomar: () => ejecutarAccion(() => TramiteActions.tomar(id), 'Trámite tomado para revisión'),
    asignar: (operadorId: string, motivo?: string) =>
      ejecutarAccion(() => TramiteActions.asignar(id, operadorId, motivo), 'Trámite asignado al operador'),
    derivar: (areaDestinoId: string, motivo?: string) =>
      ejecutarAccion(() => TramiteActions.derivar(id, areaDestinoId, motivo), 'Trámite derivado a nueva área'),
    observar: (motivo: string) =>
      ejecutarAccion(() => TramiteActions.observar(id, motivo), 'Observación enviada al solicitante'),
    responderObservacion: (respuesta: string) =>
      ejecutarAccion(() => TramiteActions.responderObservacion(id, respuesta), 'Respuesta a observación enviada'),
    solicitarIntervencionExterna: (motivo: string) =>
      ejecutarAccion(
        () => TramiteActions.solicitarIntervencionExterna(id, motivo),
        'Intervención externa solicitada',
      ),
    responderIntervencionExterna: (respuesta: string) =>
      ejecutarAccion(
        () => TramiteActions.responderIntervencionExterna(id, respuesta),
        'Respuesta a intervención enviada',
      ),
    aprobar: (motivo?: string) => ejecutarAccion(() => TramiteActions.aprobar(id, motivo), 'Trámite aprobado'),
    rechazar: (motivo: string) => ejecutarAccion(() => TramiteActions.rechazar(id, motivo), 'Trámite rechazado'),
    cerrar: (motivo?: string) => ejecutarAccion(() => TramiteActions.cerrar(id, motivo), 'Trámite cerrado'),
    cancelar: (motivo: string) => ejecutarAccion(() => TramiteActions.cancelar(id, motivo), 'Trámite cancelado'),

    agregarComentario: (mensaje: string, visibilidad: 'INTERNA' | 'EXTERNA' | 'TODOS') =>
      ejecutarAccion(
        () => TramiteActions.agregarComentario(id, mensaje, visibilidad),
        'Comentario añadido correctamente',
      ),
    adjuntarDocumento: (doc: { nombreArchivo: string; mimeType: string; size: number; storageKey: string }) =>
      ejecutarAccion(() => TramiteActions.adjuntarDocumento(id, doc), 'Documento adjuntado exitosamente'),
    eliminarDocumento: (docId: string) =>
      ejecutarAccion(() => TramiteActions.eliminarDocumento(id, docId), 'Documento eliminado'),
  };
}
