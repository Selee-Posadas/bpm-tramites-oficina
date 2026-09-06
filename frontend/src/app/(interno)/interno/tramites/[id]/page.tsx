'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid2 as Grid,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CommentIcon from '@mui/icons-material/Comment';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTramite } from '@/features/tramites/hooks/useTramite';
import { useAuth } from '@/shared/context/AuthContext';
import { useAreas } from '@/features/areas/hooks/useAreas';
import { EstadoBadge } from '@/shared/components/Badges/EstadoBadge';
import { PrioridadBadge } from '@/shared/components/Badges/PrioridadBadge';
import { SlaBadge } from '@/shared/components/Badges/SlaBadge';
import { TramiteTimeline } from '@/shared/components/Timeline/TramiteTimeline';
import { WorkflowActionBar } from '@/features/tramites/components/WorkflowActionBar';
import { ComentariosSection } from '@/features/tramites/components/ComentariosSection';
import { DocumentosSection } from '@/features/tramites/components/DocumentosSection';
import { CardDetailSkeleton } from '@/shared/components/Feedback/LoadingSkeleton';

export default function InternoTramiteDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { areas } = useAreas();
  const {
    tramite,
    isLoading,
    isActionLoading,
    error,
    ingresar,
    tomar,
    asignar,
    derivar,
    observar,
    responderObservacion,
    solicitarIntervencionExterna,
    responderIntervencionExterna,
    aprobar,
    rechazar,
    cerrar,
    cancelar,
    agregarComentario,
    adjuntarDocumento,
    eliminarDocumento,
  } = useTramite(id);

  const [currentTab, setCurrentTab] = useState(0);

  if (isLoading) {
    return <CardDetailSkeleton />;
  }

  if (error || !tramite) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px solid #fecaca', bgcolor: '#fff5f5', borderRadius: 2 }}>
        <Typography color="error" variant="h6">
          No se pudo encontrar el trámite solicitado.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          {error || 'El recurso no existe o fue eliminado.'}
        </Typography>
        <Button component={Link} href="/interno/bandeja" variant="contained">
          Volver a la Bandeja
        </Button>
      </Paper>
    );
  }

  const fechaCreacion = new Date(tramite.fechaCreacion).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const areaNombre = areas.find((a) => a.id === tramite.areaActualId)?.nombre || tramite.areaActualId || 'Sin asignar';

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button component={Link} href="/interno/bandeja" startIcon={<ArrowBackIcon />} color="inherit" sx={{ mr: 2 }}>
          Bandeja
        </Button>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
          EXPEDIENTE {tramite.numero}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <div>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
              {tramite.titulo}
            </Typography>
            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
              {tramite.tipoTramiteNombre} {tramite.tipoTramiteCodigo ? `(${tramite.tipoTramiteCodigo})` : ''}
            </Typography>
          </div>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <EstadoBadge estado={tramite.estado} size="medium" />
            <PrioridadBadge prioridad={tramite.prioridad} size="medium" />
            <SlaBadge sla={tramite.sla} />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Área Actual Asignada
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {areaNombre}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Operador Responsable
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {tramite.usuarioAsignadoId || 'Sin tomar / No asignado'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Iniciado Por
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {tramite.creadoPorTipo} ({tramite.creadoPorId})
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Fecha de Inicio
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {fechaCreacion}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.secondary' }}>
            Descripción y Fundamentación:
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', whiteSpace: 'pre-wrap' }}>
            {tramite.descripcion}
          </Typography>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', overflow: 'hidden', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab icon={<HistoryIcon />} iconPosition="start" label={`Historial (${tramite.movimientos.length})`} />
          <Tab icon={<AttachFileIcon />} iconPosition="start" label={`Documentos (${tramite.documentos.length})`} />
          <Tab icon={<CommentIcon />} iconPosition="start" label={`Comentarios (${tramite.comentarios.length})`} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {currentTab === 0 && <TramiteTimeline movimientos={tramite.movimientos} />}
          {currentTab === 1 && (
            <DocumentosSection
              documentos={tramite.documentos}
              user={user}
              isLoading={isActionLoading}
              onAdjuntar={adjuntarDocumento}
              onEliminar={eliminarDocumento}
            />
          )}
          {currentTab === 2 && (
            <ComentariosSection
              comentarios={tramite.comentarios}
              user={user}
              isLoading={isActionLoading}
              onAgregarComentario={agregarComentario}
            />
          )}
        </Box>
      </Paper>

      <WorkflowActionBar
        tramite={tramite}
        user={user}
        areas={areas}
        isActionLoading={isActionLoading}
        onIngresar={ingresar}
        onTomar={tomar}
        onAsignar={asignar}
        onDerivar={derivar}
        onObservar={observar}
        onResponderObservacion={responderObservacion}
        onSolicitarIntervencionExterna={solicitarIntervencionExterna}
        onResponderIntervencionExterna={responderIntervencionExterna}
        onAprobar={aprobar}
        onRechazar={rechazar}
        onCerrar={cerrar}
        onCancelar={cancelar}
      />
    </Box>
  );
}
