'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Chip } from '@mui/material';
import DomainOutlinedIcon from '@mui/icons-material/DomainOutlined';
import { AreaStatItem } from '../interfaces/dashboard.interface';

interface AreaWorkloadCardProps {
  areas: AreaStatItem[];
}

const PALETTE = ['#2563eb', '#0d9488', '#d97706', '#9333ea', '#e11d48', '#0284c7'];

export const AreaWorkloadCard: React.FC<AreaWorkloadCardProps> = ({ areas }) => {
  return (
    <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          <DomainOutlinedIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Carga de Trabajo por Área
          </Typography>
        </Box>

        {areas.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay trámites asignados a áreas actualmente.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {areas.map((area, index) => {
              const color = PALETTE[index % PALETTE.length];
              return (
                <Box key={area.areaId}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 0.75,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {area.nombreArea}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {area.cantidad} {area.cantidad === 1 ? 'trámite' : 'trámites'}
                      </Typography>
                      <Chip
                        label={`${area.porcentaje}%`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          bgcolor: `${color}15`,
                          color: color,
                        }}
                      />
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={area.porcentaje}
                    sx={{
                      height: 7,
                      borderRadius: 4,
                      bgcolor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: color,
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
