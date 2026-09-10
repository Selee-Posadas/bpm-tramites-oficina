'use client';

import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Link from 'next/link';
import { useTramiteList } from '@/features/tramites/hooks/useTramiteList';
import { useAreas } from '@/features/areas/hooks/useAreas';
import { useTiposTramite } from '@/features/tipos-tramite/hooks/useTiposTramite';
import { useAuth } from '@/shared/context/AuthContext';
import { TramiteFilterBar } from '@/features/tramites/components/TramiteFilterBar';
import { TramiteTable } from '@/features/tramites/components/TramiteTable';
import { LoadingSkeleton } from '@/shared/components/Feedback/LoadingSkeleton';

export default function InternoBandejaPage() {
  const { user } = useAuth();
  const { areas } = useAreas();
  const { tiposTramite } = useTiposTramite();

  const areaUsuario = areas.find((a) => a.id === user?.areaId);
  const esRestringido = (user?.rolInterno === 'OPERADOR' || user?.rolInterno === 'SUPERVISOR') && Boolean(user?.areaId);

  const { tramites, total, filtros, isLoading, actualizarFiltros, cambiarPagina } = useTramiteList({
    take: 10,
    areaId: esRestringido ? user?.areaId : undefined,
  });

  const handleReset = () => {
    actualizarFiltros({
      estado: undefined,
      areaId: esRestringido ? user?.areaId : undefined,
      prioridad: undefined,
      tipoTramiteId: undefined,
      soloVencidos: false,
      busqueda: '',
      skip: 0,
    });
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              {esRestringido && areaUsuario
                ? `Bandeja de Trámites — ${areaUsuario.nombre}`
                : user?.rolInterno === 'MESA_ENTRADA'
                ? 'Bandeja de Mesa de Entradas'
                : 'Bandeja General de Trámites'}
            </Typography>
            {esRestringido && areaUsuario && (
              <Chip
                label={`Tu Área: ${areaUsuario.nombre}`}
                color="primary"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {esRestringido && areaUsuario
              ? `Expedientes radicados en tu área para gestión operativa (${total} trámites)`
              : `Gestión, seguimiento y auditoría global de expedientes (${total} trámites encontrados)`}
          </Typography>
        </div>

        <Button
          component={Link}
          href="/interno/tramites/nuevo"
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
        >
          Iniciar Nuevo Trámite
        </Button>
      </Box>

      <TramiteFilterBar
        filtros={filtros}
        areas={areas}
        tiposTramite={tiposTramite}
        onFiltrosChange={actualizarFiltros}
        onReset={handleReset}
        rolUsuario={user?.rolInterno}
        areaUsuarioId={user?.areaId}
      />

      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <TramiteTable
          tramites={tramites}
          total={total}
          skip={filtros.skip || 0}
          take={filtros.take || 10}
          onPageChange={cambiarPagina}
          basePath="/interno/tramites"
        />
      )}
    </Box>
  );
}
