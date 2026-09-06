'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardStats } from '../interfaces/dashboard.interface';
import { DashboardActions } from '../actions/dashboard.actions';

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await DashboardActions.obtenerEstadisticas();
      setStats(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar métricas del dashboard';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return {
    stats,
    isLoading,
    error,
    recargar: cargar,
  };
}
