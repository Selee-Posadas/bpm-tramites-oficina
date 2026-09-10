'use client';

import React, { useState } from 'react';
import { Box, Typography, LinearProgress, Chip, Tooltip } from '@mui/material';

import { EstadoDistributionChartProps, SliceData } from '../interfaces/dashboard.interface';

export const ESTADO_CONFIG: Record<string, { label: string; color: string; bgSoft: string }> = {
  BORRADOR: { label: 'Borrador', color: '#94a3b8', bgSoft: '#f8fafc' },
  INGRESADO: { label: 'Ingresado', color: '#0284c7', bgSoft: '#e0f2fe' },
  EN_REVISION: { label: 'En Revisión', color: '#2563eb', bgSoft: '#dbeafe' },
  OBSERVADO: { label: 'Observado', color: '#d97706', bgSoft: '#fef3c7' },
  DERIVADO: { label: 'Derivado', color: '#7c3aed', bgSoft: '#ede9fe' },
  ESPERANDO_EXTERNO: { label: 'Esperando Externo', color: '#ea580c', bgSoft: '#ffedd5' },
  ESPERANDO_INTERNO: { label: 'Esperando Interno', color: '#0891b2', bgSoft: '#cffafe' },
  APROBADO: { label: 'Aprobado', color: '#16a34a', bgSoft: '#dcfce7' },
  RECHAZADO: { label: 'Rechazado', color: '#dc2626', bgSoft: '#fee2e2' },
  CERRADO: { label: 'Cerrado', color: '#475569', bgSoft: '#f1f5f9' },
  CANCELADO: { label: 'Cancelado', color: '#64748b', bgSoft: '#f1f5f9' },
};

export const EstadoDistributionChart: React.FC<EstadoDistributionChartProps> = ({
  estados,
  total,
}) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const radius = 54;
  const strokeWidth = 16;
  const hoverStrokeWidth = 22;
  const circumference = 2 * Math.PI * radius;
  const size = 148;
  const center = size / 2;

  const activeEntries = Object.entries(estados || {}).filter(([, cantidad]) => cantidad > 0);

  const totalCalculado = total > 0 ? total : activeEntries.reduce((acc, [, cant]) => acc + cant, 0);

  let currentOffset = 0;
  const slices: SliceData[] = activeEntries.map(([estado, cantidad]) => {
    const config = ESTADO_CONFIG[estado] || {
      label: estado,
      color: '#6b7280',
      bgSoft: '#f3f4f6',
    };
    const porcentaje = totalCalculado > 0 ? Math.round((cantidad / totalCalculado) * 100) : 0;
    const length = (cantidad / totalCalculado) * circumference;
    const slice: SliceData = {
      estado,
      label: config.label,
      cantidad,
      porcentaje,
      color: config.color,
      bgSoft: config.bgSoft,
      offset: currentOffset,
      length,
    };
    currentOffset += length;
    return slice;
  });

  const activeSlice = slices.find((s) => s.estado === hoveredState);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        gap: { xs: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: size,
          height: size,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {slices.map((slice) => {
            const isHovered = hoveredState === slice.estado;
            const gap = slices.length > 1 ? 2 : 0;
            const dashLength = Math.max(0, slice.length - gap);
            return (
              <circle
                key={slice.estado}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={isHovered ? hoverStrokeWidth : strokeWidth}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={-slice.offset}
                strokeLinecap="round"
                onMouseEnter={() => setHoveredState(slice.estado)}
                onMouseLeave={() => setHoveredState(null)}
                style={{
                  cursor: 'pointer',
                  transition: 'stroke-width 0.2s ease, opacity 0.2s ease, filter 0.2s ease',
                  opacity: hoveredState && !isHovered ? 0.45 : 1,
                  filter: isHovered ? `drop-shadow(0 0 6px ${slice.color}66)` : 'none',
                }}
              />
            );
          })}
        </svg>

        <Box
          sx={{
            position: 'absolute',
            textAlign: 'center',
            pointerEvents: 'none',
            px: 1,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              fontSize: '1.45rem',
              color: activeSlice ? activeSlice.color : 'text.primary',
              lineHeight: 1.1,
              transition: 'color 0.2s ease',
            }}
          >
            {activeSlice ? activeSlice.cantidad : totalCalculado}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.65rem',
              display: 'block',
              mt: 0.2,
            }}
          >
            {activeSlice ? `${activeSlice.porcentaje}%` : 'Total'}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          width: '100%',
          display: slices.length === 0 ? 'block' : 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          columnGap: 2,
          rowGap: 0.75,
        }}
      >
        {slices.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}
          >
            No hay trámites registrados para mostrar en el gráfico.
          </Typography>
        ) : (
          slices.map((slice) => {
            const isHovered = hoveredState === slice.estado;
            return (
              <Box
                key={slice.estado}
                onMouseEnter={() => setHoveredState(slice.estado)}
                onMouseLeave={() => setHoveredState(null)}
                sx={{
                  py: 0.4,
                  px: 0.75,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  bgcolor: isHovered ? 'rgba(0,0,0,0.035)' : 'transparent',
                  transition: 'background-color 0.15s ease',
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: slice.color,
                        flexShrink: 0,
                        boxShadow: `0 0 5px ${slice.color}66`,
                      }}
                    />
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        fontWeight: isHovered ? 700 : 500,
                        color: isHovered ? slice.color : 'text.primary',
                        fontSize: '0.75rem',
                      }}
                    >
                      {slice.label}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0, ml: 1 }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                      {slice.cantidad}
                    </Typography>
                    <Chip
                      label={`${slice.porcentaje}%`}
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        bgcolor: slice.bgSoft,
                        color: slice.color,
                        border: `1px solid ${slice.color}33`,
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
                      width: `${slice.porcentaje}%`,
                      bgcolor: slice.color,
                      height: '100%',
                      borderRadius: 2,
                      transition: 'width 0.4s ease-in-out',
                    }}
                  />
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};
