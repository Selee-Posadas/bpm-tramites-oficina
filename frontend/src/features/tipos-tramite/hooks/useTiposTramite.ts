'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TipoTramite, TipoTramiteFormValues } from '../interfaces/tipo-tramite.interface';
import { TipoTramiteActions } from '../actions/tipo-tramite.actions';
import { useNotification } from '../../../shared/context/NotificationContext';

export function useTiposTramite(soloActivos: boolean = false) {
  const [tiposTramite, setTiposTramite] = useState<TipoTramite[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess } = useNotification();
  const isMountedRef = useRef<boolean>(true);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await TipoTramiteActions.listar(soloActivos);
      if (isMountedRef.current) {
        setTiposTramite(data);
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        const msg = err instanceof Error ? err.message : 'Error al cargar tipos de trámite';
        setError(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [soloActivos]);

  useEffect(() => {
    isMountedRef.current = true;
    cargar();

    return () => {
      isMountedRef.current = false;
    };
  }, [cargar]);

  const crear = async (values: TipoTramiteFormValues): Promise<boolean> => {
    try {
      await TipoTramiteActions.crear(values);
      showSuccess('Tipo de trámite creado exitosamente');
      await cargar();
      return true;
    } catch {
      return false;
    }
  };

  const actualizar = async (id: string, values: { slaHoras?: number; activo?: boolean }): Promise<boolean> => {
    try {
      await TipoTramiteActions.actualizar(id, values);
      showSuccess('Tipo de trámite actualizado exitosamente');
      await cargar();
      return true;
    } catch {
      return false;
    }
  };

  return {
    tiposTramite,
    isLoading,
    error,
    recargar: cargar,
    crear,
    actualizar,
  };
}
