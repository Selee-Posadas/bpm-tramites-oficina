'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Area, AreaFormValues } from '../interfaces/area.interface';
import { AreaActions } from '../actions/area.actions';
import { useNotification } from '../../../shared/context/NotificationContext';

export function useAreas(soloActivas: boolean = false) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess } = useNotification();
  const isMountedRef = useRef<boolean>(true);

  const cargarAreas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await AreaActions.listarAreas(soloActivas);
      if (isMountedRef.current) {
        setAreas(data);
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        const msg = err instanceof Error ? err.message : 'Error al cargar áreas';
        setError(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [soloActivas]);

  useEffect(() => {
    isMountedRef.current = true;
    cargarAreas();

    return () => {
      isMountedRef.current = false;
    };
  }, [cargarAreas]);

  const crearArea = async (values: AreaFormValues): Promise<boolean> => {
    try {
      await AreaActions.crearArea(values);
      showSuccess('Área creada exitosamente');
      await cargarAreas();
      return true;
    } catch {
      return false;
    }
  };

  const actualizarArea = async (id: string, values: AreaFormValues): Promise<boolean> => {
    try {
      await AreaActions.actualizarArea(id, values);
      showSuccess('Área actualizada exitosamente');
      await cargarAreas();
      return true;
    } catch {
      return false;
    }
  };

  return {
    areas,
    isLoading,
    error,
    recargar: cargarAreas,
    crearArea,
    actualizarArea,
  };
}
