'use client';

import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAreas } from '@/features/areas/hooks/useAreas';
import { Area } from '@/features/areas/interfaces/area.interface';
import { AreaTable } from '@/features/areas/components/AreaTable';
import { AreaCreateModal } from '@/features/areas/components/AreaCreateModal';
import { AreaEditModal } from '@/features/areas/components/AreaEditModal';
import { LoadingSkeleton } from '@/shared/components/Feedback/LoadingSkeleton';

export default function ConfigAreasPage() {
  const { areas, isLoading, crearArea, actualizarArea } = useAreas(false);
  const [modalCreateOpen, setModalCreateOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  if (isLoading) {
    return <LoadingSkeleton rows={3} />;
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Configuración de Áreas Organizacionales
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Catálogo de dependencias, gerencias y sectores para derivación de trámites
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setModalCreateOpen(true)}
          id="btn-nueva-area"
        >
          Nueva Área
        </Button>
      </Box>

      <AreaTable
        areas={areas}
        onEdit={(area) => setEditingArea(area)}
      />

      <AreaCreateModal
        open={modalCreateOpen}
        onClose={() => setModalCreateOpen(false)}
        onSubmit={crearArea}
      />

      <AreaEditModal
        open={Boolean(editingArea)}
        area={editingArea}
        onClose={() => setEditingArea(null)}
        onSubmit={actualizarArea}
      />
    </Box>
  );
}
