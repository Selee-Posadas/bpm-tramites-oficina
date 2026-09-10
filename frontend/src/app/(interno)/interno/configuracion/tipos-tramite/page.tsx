'use client';

import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTiposTramite } from '@/features/tipos-tramite/hooks/useTiposTramite';
import { useAreas } from '@/features/areas/hooks/useAreas';
import { TipoTramite } from '@/features/tipos-tramite/interfaces/tipo-tramite.interface';
import { TipoTramiteTable } from '@/features/tipos-tramite/components/TipoTramiteTable';
import { TipoTramiteCreateModal } from '@/features/tipos-tramite/components/TipoTramiteCreateModal';
import { TipoTramiteEditModal } from '@/features/tipos-tramite/components/TipoTramiteEditModal';
import { LoadingSkeleton } from '@/shared/components/Feedback/LoadingSkeleton';

export default function ConfigTiposTramitePage() {
  const { tiposTramite, isLoading, crear, actualizar } = useTiposTramite(false);
  const { areas } = useAreas();
  const [modalCreateOpen, setModalCreateOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoTramite | null>(null);

  if (isLoading) {
    return <LoadingSkeleton rows={4} />;
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Configuración de Tipos de Trámite
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administración del catálogo, parámetros de SLA y habilitación de circuitos
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setModalCreateOpen(true)}
          id="btn-nuevo-tipo-tramite"
        >
          Nuevo Tipo de Trámite
        </Button>
      </Box>

      <TipoTramiteTable
        tiposTramite={tiposTramite}
        onEdit={(tipo) => setEditingTipo(tipo)}
      />

      <TipoTramiteCreateModal
        open={modalCreateOpen}
        areas={areas}
        onClose={() => setModalCreateOpen(false)}
        onSubmit={crear}
      />

      <TipoTramiteEditModal
        open={Boolean(editingTipo)}
        tipo={editingTipo}
        onClose={() => setEditingTipo(null)}
        onSubmit={actualizar}
      />
    </Box>
  );
}
