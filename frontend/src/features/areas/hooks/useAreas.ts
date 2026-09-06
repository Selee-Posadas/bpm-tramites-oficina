'use client';

import { useState, useEffect, useCallback } from 'react';
import { Area, AreaFormValues } from '../interfaces/area.interface';
import { AreaActions } from '../actions/area.actions';
import { useNotification } from '../../../shared/context/NotificationContext';

export function useAreas(soloActivas: boolean = false) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useNotification();

  const cargarAreas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await AreaActions.listarAreas(soloActivas);
      setAreas(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar áreas';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [soloActivas]);

  useEffect(() => {
    cargarAreas();
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
