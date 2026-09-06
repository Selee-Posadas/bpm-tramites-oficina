'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Link from 'next/link';
import { useTramiteList } from '@/features/tramites/hooks/useTramiteList';
import { TramiteTable } from '@/features/tramites/components/TramiteTable';
import { LoadingSkeleton } from '@/shared/components/Feedback/LoadingSkeleton';

export default function ExternoMisTramitesPage() {
  const { tramites, total, filtros, isLoading, cambiarPagina } = useTramiteList({ take: 10 });

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'secondary.dark' }}>
            Mis Trámites y Solicitudes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Consulte el estado de avance, responda observaciones y descargue resoluciones
          </Typography>
        </div>

        <Button
          component={Link}
          href="/externo/tramites/nuevo"
          variant="contained"
          color="secondary"
          startIcon={<AddCircleOutlineIcon />}
        >
          Iniciar Nuevo Trámite
        </Button>
      </Box>

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <TramiteTable
          tramites={tramites}
          total={total}
          skip={filtros.skip || 0}
          take={filtros.take || 10}
          onPageChange={cambiarPagina}
          basePath="/externo/tramites"
        />
      )}
    </Box>
  );
}
