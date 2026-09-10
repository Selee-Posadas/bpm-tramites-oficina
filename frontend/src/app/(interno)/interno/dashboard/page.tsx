'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid2 as Grid,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Chip,
  Paper,
} from '@mui/material';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Link from 'next/link';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { LoadingSkeleton } from '@/shared/components/Feedback/LoadingSkeleton';
import { EstadoBadge } from '@/shared/components/Badges/EstadoBadge';
import { PrioridadBadge } from '@/shared/components/Badges/PrioridadBadge';
import { EstadoDistributionChart } from '@/features/dashboard/components/EstadoDistributionChart';

export default function InternoDashboardPage() {
  const { stats, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Dashboard Operativo
        </Typography>
        <LoadingSkeleton rows={4} />
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px solid #fecaca', bgcolor: '#fff5f5', borderRadius: 2 }}>
        <Typography color="error" variant="h6">
          No se pudieron cargar las estadísticas del sistema.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {error || 'Servicio no disponible'}
        </Typography>
      </Paper>
    );
  }

  const tramitesPorEstado = stats.tramitesPorEstado || {};
  const tramitesPorPrioridad = stats.tramitesPorPrioridad || {};
  const enRevisionCount = tramitesPorEstado['EN_REVISION'] || 0;
  const enTerminoCount = stats.tramitesEnTerminoSla || 0;
  const vencidosCount = stats.tramitesVencidosSla || 0;
  const cumplimiento = stats.cumplimientoSlaPorcentaje || 0;

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Dashboard Operativo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visión global del flujo de trámites, cumplimiento de SLA y carga de trabajo
          </Typography>
        </div>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            component={Link}
            href="/interno/bandeja"
            variant="outlined"
            color="primary"
            endIcon={<ArrowForwardIcon />}
          >
            Ir a la Bandeja
          </Button>
          <Button
            component={Link}
            href="/interno/tramites/nuevo"
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
          >
            Nuevo Trámite
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Total de Trámites
                </Typography>
                <AssessmentOutlinedIcon color="primary" />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {stats.totalTramites}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Registrados en el sistema
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  En Revisión
                </Typography>
                <PendingActionsIcon color="info" />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main' }}>
                {enRevisionCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Expedientes bajo análisis activo
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: vencidosCount > 0 ? '#fca5a5' : '#e2e8f0',
              bgcolor: vencidosCount > 0 ? '#fef2f2' : '#ffffff',
              borderRadius: 2,
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 700 }}>
                  SLA Vencido
                </Typography>
                <WarningAmberIcon color="error" />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'error.main' }}>
                {vencidosCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Requieren atención urgente
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Cumplimiento SLA
                </Typography>
                <CheckCircleOutlineIcon color="success" />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                {cumplimiento}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={cumplimiento}
                color={cumplimiento >= 80 ? 'success' : cumplimiento >= 50 ? 'warning' : 'error'}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
                Distribución de Trámites por Estado
              </Typography>
              <EstadoDistributionChart
                estados={tramitesPorEstado}
                total={stats.totalTramites}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: 3,
              height: 'fit-content',
              bgcolor: '#ffffff',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Trámites por Nivel de Prioridad
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(['BAJA', 'MEDIA', 'ALTA', 'URGENTE'] as const).map((p) => {
                  const cantidad = tramitesPorPrioridad[p] ?? 0;
                  return (
                    <Box
                      key={p}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        px: 1,
                        borderBottom: '1px solid #f1f5f9',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <PrioridadBadge prioridad={p} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {cantidad}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
