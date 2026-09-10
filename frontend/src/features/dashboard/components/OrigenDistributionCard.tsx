'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Chip } from '@mui/material';
import AltRouteOutlinedIcon from '@mui/icons-material/AltRouteOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BusinessIcon from '@mui/icons-material/Business';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import { OrigenStatItem } from '../interfaces/dashboard.interface';

interface OrigenDistributionCardProps {
  origenes: OrigenStatItem[];
  total: number;
}

const ORIGEN_COLORS: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  EXTERNO_INTERNO: {
    color: '#0284c7',
    bg: '#e0f2fe',
    icon: <PersonOutlineIcon fontSize="small" sx={{ color: '#0284c7' }} />,
  },
  INTERNO_INTERNO: {
    color: '#7c3aed',
    bg: '#ede9fe',
    icon: <BusinessIcon fontSize="small" sx={{ color: '#7c3aed' }} />,
  },
  INTERNO_EXTERNO: {
    color: '#ea580c',
    bg: '#ffedd5',
    icon: <SyncAltIcon fontSize="small" sx={{ color: '#ea580c' }} />,
  },
};

export const OrigenDistributionCard: React.FC<OrigenDistributionCardProps> = ({
  origenes,
  total,
}) => {
  return (
    <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          <AltRouteOutlinedIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Trámites por Circuito de Origen
          </Typography>
        </Box>

        {origenes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay datos de origen registrados.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {origenes.map((item) => {
              const style = ORIGEN_COLORS[item.origen] || {
                color: '#64748b',
                bg: '#f1f5f9',
                icon: <AltRouteOutlinedIcon fontSize="small" sx={{ color: '#64748b' }} />,
              };

              return (
                <Box key={item.origen}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 0.75,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          p: 0.5,
                          borderRadius: 1,
                          bgcolor: style.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {style.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {item.label}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {item.cantidad}
                      </Typography>
                      <Chip
                        label={`${item.porcentaje}%`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          bgcolor: style.bg,
                          color: style.color,
                        }}
                      />
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.porcentaje}
                    sx={{
                      height: 7,
                      borderRadius: 4,
                      bgcolor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: style.color,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
