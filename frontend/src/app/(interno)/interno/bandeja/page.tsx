'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Link from 'next/link';
import { useTramiteList } from '@/features/tramites/hooks/useTramiteList';
import { useAreas } from '@/features/areas/hooks/useAreas';
import { useTiposTramite } from '@/features/tipos-tramite/hooks/useTiposTramite';
import { TramiteFilterBar } from '@/features/tramites/components/TramiteFilterBar';
import { TramiteTable } from '@/features/tramites/components/TramiteTable';
import { LoadingSkeleton } from '@/shared/components/Feedback/LoadingSkeleton';

export default function InternoBandejaPage() {
  const { tramites, total, filtros, isLoading, actualizarFiltros, cambiarPagina } = useTramiteList({ take: 10 });
  const { areas } = useAreas();
  const { tiposTramite } = useTiposTramite();

  const handleReset = () => {
    actualizarFiltros({
      estado: undefined,
      areaId: undefined,
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
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Bandeja General de Trámites
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión, seguimiento y resolución operativa de expedientes ({total} trámites encontrados)
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
