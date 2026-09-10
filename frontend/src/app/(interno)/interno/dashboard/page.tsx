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
  Paper,
  Chip,
} from '@mui/material';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Link from 'next/link';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { LoadingSkeleton } from '@/shared/components/Feedback/LoadingSkeleton';
import { PrioridadBadge } from '@/shared/components/Badges/PrioridadBadge';
import { EstadoDistributionChart } from '@/features/dashboard/components/EstadoDistributionChart';
import { OrigenDistributionCard } from '@/features/dashboard/components/OrigenDistributionCard';
import { AreaWorkloadCard } from '@/features/dashboard/components/AreaWorkloadCard';
import { UltimosMovimientosTable } from '@/features/dashboard/components/UltimosMovimientosTable';

const PRIORIDAD_COLORS: Record<string, { color: string; bg: string }> = {
  BAJA: { color: '#64748b', bg: '#f1f5f9' },
  MEDIA: { color: '#0284c7', bg: '#e0f2fe' },
  ALTA: { color: '#d97706', bg: '#fef3c7' },
  URGENTE: { color: '#dc2626', bg: '#fee2e2' },
};

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
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          border: '1px solid #fecaca',
          bgcolor: '#fff5f5',
          borderRadius: 2,
        }}
      >
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
  const vencidosCount = stats.tramitesVencidosSla || 0;
  const cumplimiento = stats.cumplimientoSlaPorcentaje || 0;
  const promedioResolucion = stats.promedioResolucionHoras || 0;

  const promedioTexto =
    promedioResolucion >= 24
      ? `${Math.round((promedioResolucion / 24) * 10) / 10} días`
      : `${promedioResolucion} h`;

  return (
    <Box sx={{ pb: 5 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <div>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Dashboard Operativo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visión global del flujo de trámites, circuitos de origen, cumplimiento de SLA y
            actividad reciente
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

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                >
                  Total Trámites
                </Typography>
                <AssessmentOutlinedIcon color="primary" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {stats.totalTramites}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Registrados en el sistema
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                >
                  En Revisión
                </Typography>
                <PendingActionsIcon color="info" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {enRevisionCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Bajo análisis activo
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
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
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography
                  variant="caption"
                  color="error.main"
                  sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                >
                  SLA Vencido
                </Typography>
                <WarningAmberIcon color="error" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                {vencidosCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Atención requerida
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                >
                  Cumplimiento SLA
                </Typography>
                <CheckCircleOutlineIcon color="success" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {cumplimiento}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={cumplimiento}
                color={cumplimiento >= 80 ? 'success' : cumplimiento >= 50 ? 'warning' : 'error'}
                sx={{ mt: 0.75, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                >
                  Resolución Media
                </Typography>
                <AccessTimeOutlinedIcon color="primary" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {promedioTexto}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tiempo promedio de cierre
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, md: 7.5 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                Distribución de Trámites por Estado
              </Typography>
              <EstadoDistributionChart estados={tramitesPorEstado} total={stats.totalTramites} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4.5 }}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              height: '100%',
              bgcolor: '#ffffff',
            }}
          >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                Trámites por Nivel de Prioridad
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85 }}>
                {(['BAJA', 'MEDIA', 'ALTA', 'URGENTE'] as const).map((p) => {
                  const cantidad = tramitesPorPrioridad[p] ?? 0;
                  const pct =
                    stats.totalTramites > 0
                      ? Math.round((cantidad / stats.totalTramites) * 100)
                      : 0;
                  const style = PRIORIDAD_COLORS[p];
                  return (
                    <Box
                      key={p}
                      sx={{
                        py: 0.4,
                        px: 0.75,
                        borderRadius: 1.5,
                        transition: 'background-color 0.15s ease',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 0.35,
                        }}
                      >
                        <PrioridadBadge prioridad={p} size="small" />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                            {cantidad}
                          </Typography>
                          <Chip
                            label={`${pct}%`}
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: '0.625rem',
                              fontWeight: 700,
                              bgcolor: style.bg,
                              color: style.color,
                              border: `1px solid ${style.color}33`,
                              px: 0,
                              '& .MuiChip-label': { px: 0.5 },
                            }}
                          />
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          width: '100%',
                          bgcolor: '#f1f5f9',
                          borderRadius: 2,
                          height: 3.5,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            width: `${pct}%`,
                            bgcolor: style.color,
                            height: '100%',
                            borderRadius: 2,
                            transition: 'width 0.4s ease-in-out',
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <OrigenDistributionCard origenes={stats.tramitesPorOrigen} total={stats.totalTramites} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AreaWorkloadCard areas={stats.tramitesPorArea} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <UltimosMovimientosTable movimientos={stats.ultimosMovimientos} />
        </Grid>
      </Grid>
    </Box>
  );
}
