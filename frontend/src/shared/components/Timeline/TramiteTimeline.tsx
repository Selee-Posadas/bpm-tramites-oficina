'use client';

import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { EstadoBadge } from '../Badges/EstadoBadge';

export interface TimelineMovimientoItem {
  id: string;
  estadoAnterior?: string | null;
  estadoNuevo: string;
  usuarioTipo: string;
  usuarioId: string;
  accion: string;
  comentario?: string | null;
  fecha: Date | string;
}

interface TramiteTimelineProps {
  movimientos: TimelineMovimientoItem[];
}

export const TramiteTimeline: React.FC<TramiteTimelineProps> = ({ movimientos }) => {
  if (!movimientos || movimientos.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        Aún no se registran movimientos en este trámite.
      </Typography>
    );
  }

  const ordenados = [...movimientos].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
  );

  return (
    <Box sx={{ position: 'relative', pl: 3, pt: 1 }}>
      <Box
        sx={{
          position: 'absolute',
          left: 11,
          top: 14,
          bottom: 14,
          width: 2,
          bgcolor: '#e2e8f0',
        }}
      />

      {ordenados.map((item, index) => {
        const fecha = new Date(item.fecha);
        const fechaFormateada = fecha.toLocaleString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <Box key={item.id || index} sx={{ position: 'relative', mb: 3 }}>
            <Box
              sx={{
                position: 'absolute',
                left: -20,
                top: 4,
                width: 18,
                height: 18,
                borderRadius: '50%',
                bgcolor: index === 0 ? 'primary.main' : '#cbd5e1',
                border: '3px solid #ffffff',
                boxShadow: 1,
              }}
            />

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                bgcolor: index === 0 ? '#f0fdf4' : '#ffffff',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={item.accion.replace(/_/g, ' ')}
                    size="small"
                    color={index === 0 ? 'primary' : 'default'}
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    por {item.usuarioTipo === 'INTERNO' ? 'Operador Interno' : 'Usuario Externo'} ({item.usuarioId})
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HistoryIcon sx={{ fontSize: 14 }} />
                  {fechaFormateada}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1, flexWrap: 'wrap' }}>
                {item.estadoAnterior && (
                  <>
                    <EstadoBadge estado={item.estadoAnterior} size="small" />
                    <ArrowForwardIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  </>
                )}
                <EstadoBadge estado={item.estadoNuevo} size="small" />
              </Box>

              {item.comentario && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    p: 1,
                    bgcolor: '#f8fafc',
                    borderRadius: 1,
                    borderLeft: '3px solid #3b82f6',
                    fontStyle: 'italic',
                    color: 'text.primary',
                  }}
                >
                  "{item.comentario}"
                </Typography>
              )}
            </Paper>
          </Box>
        );
      })}
    </Box>
  );
};
