'use client';

import React from 'react';
import { Chip, ChipProps } from '@mui/material';

import { EstadoBadgeProps, EstadoTramite } from '../../interfaces/badges.interface';

export type { EstadoBadgeProps, EstadoTramite };

const estadoConfig: Record<
  string,
  { label: string; color: ChipProps['color']; variant?: ChipProps['variant']; bgcolor?: string; textColor?: string }
> = {
  BORRADOR: { label: 'Borrador', color: 'default' },
  INGRESADO: { label: 'Ingresado', color: 'info' },
  EN_REVISION: { label: 'En Revisión', color: 'primary' },
  OBSERVADO: { label: 'Observado', color: 'warning' },
  DERIVADO: { label: 'Derivado', color: 'secondary' },
  ESPERANDO_EXTERNO: { label: 'Esperando Externo', color: 'warning', variant: 'outlined' },
  ESPERANDO_INTERNO: { label: 'Esperando Interno', color: 'info', variant: 'outlined' },
  APROBADO: { label: 'Aprobado', color: 'success' },
  RECHAZADO: { label: 'Rechazado', color: 'error' },
  CERRADO: { label: 'Cerrado', color: 'default', variant: 'outlined' },
  CANCELADO: { label: 'Cancelado', color: 'error', variant: 'outlined' },
};

export const EstadoBadge: React.FC<EstadoBadgeProps> = ({ estado, size = 'small' }) => {
  const config = estadoConfig[estado] || { label: estado, color: 'default' };

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
