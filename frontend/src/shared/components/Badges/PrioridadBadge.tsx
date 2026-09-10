'use client';

import React from 'react';
import { Chip, ChipProps } from '@mui/material';

import { PrioridadBadgeProps, PrioridadTramite } from '../../interfaces/badges.interface';

export type { PrioridadBadgeProps, PrioridadTramite };

const prioridadConfig: Record<string, { label: string; color: ChipProps['color']; variant?: ChipProps['variant'] }> = {
  BAJA: { label: 'Baja', color: 'default' },
  MEDIA: { label: 'Media', color: 'info' },
  ALTA: { label: 'Alta', color: 'warning' },
  URGENTE: { label: 'Urgente', color: 'error' },
};

export const PrioridadBadge: React.FC<PrioridadBadgeProps> = ({ prioridad, size = 'small' }) => {
  const config = prioridadConfig[prioridad] || { label: prioridad, color: 'default' };

  return (
    <Chip
      label={config.label}
      color={config.color}
      variant={config.variant || 'filled'}
      size={size}
      sx={{
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
      }}
    />
  );
};
