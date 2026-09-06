'use client';

import React from 'react';
import { Chip, ChipProps } from '@mui/material';

export type PrioridadTramite = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';

interface PrioridadBadgeProps {
  prioridad: PrioridadTramite | string;
  size?: ChipProps['size'];
}

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
