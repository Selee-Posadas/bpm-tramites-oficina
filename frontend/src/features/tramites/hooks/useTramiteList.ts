'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TramiteFiltros, TramiteResumen } from '../interfaces/tramite.interface';
import { TramiteActions } from '../actions/tramite.actions';

export function useTramiteList(initialFiltros: TramiteFiltros = {}) {
  const [tramites, setTramites] = useState<TramiteResumen[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [filtros, setFiltros] = useState<TramiteFiltros>({
    skip: 0,
    take: 10,
    ...initialFiltros,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await TramiteActions.listar(filtros);
      if (isMountedRef.current) {
        setTramites(data.items);
        setTotal(data.total);
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        const msg = err instanceof Error ? err.message : 'Error al cargar listado de trámites';
        setError(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [filtros]);

  useEffect(() => {
    isMountedRef.current = true;
    cargar();

    return () => {
      isMountedRef.current = false;
    };
  }, [cargar]);

  const actualizarFiltros = (nuevosFiltros: Partial<TramiteFiltros>) => {
    setFiltros((prev) => ({
      ...prev,
      ...nuevosFiltros,
      skip: nuevosFiltros.skip !== undefined ? nuevosFiltros.skip : 0,
    }));
  };

  const cambiarPagina = (nuevaPagina: number) => {
    const take = filtros.take || 10;
    actualizarFiltros({ skip: nuevaPagina * take, take });
  };

  return {
    tramites,
    total,
    filtros,
    isLoading,
    error,
    actualizarFiltros,
    cambiarPagina,
    recargar: cargar,
  };
}
