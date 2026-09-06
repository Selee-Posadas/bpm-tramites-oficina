'use client';

import React from 'react';
import { Chip, Box, Typography, Tooltip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';

export interface SlaInfoProps {
  vencido: boolean;
  horasRestantes: number;
  porcentajeConsumido: number;
  fechaLimite?: Date | string;
}

interface SlaBadgeProps {
  sla: SlaInfoProps;
  showProgress?: boolean;
}

export const SlaBadge: React.FC<SlaBadgeProps> = ({ sla, showProgress = false }) => {
  if (sla.vencido) {
    return (
      <Tooltip title={`SLA Vencido por ${Math.abs(sla.horasRestantes)} horas`}>
        <Chip
          icon={<ErrorIcon />}
          label={`Vencido (${Math.abs(sla.horasRestantes)}h)`}
          color="error"
          size="small"
          sx={{ fontWeight: 700 }}
        />
      </Tooltip>
    );
  }

  const proximoAVencer = sla.horasRestantes <= 6 || sla.porcentajeConsumido >= 80;

  if (proximoAVencer) {
    return (
      <Tooltip title={`Quedan ${sla.horasRestantes} horas (${Math.round(sla.porcentajeConsumido)}% del tiempo)`}>
        <Chip
          icon={<WarningAmberIcon />}
          label={`${sla.horasRestantes}h restantes`}
          color="warning"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip title={`En término: restan ${sla.horasRestantes}h (${Math.round(sla.porcentajeConsumido)}% consumido)`}>
      <Chip
        icon={<AccessTimeIcon />}
        label={`${sla.horasRestantes}h`}
        color="success"
        size="small"
        variant="outlined"
        sx={{ fontWeight: 500 }}
      />
    </Tooltip>
  );
};
