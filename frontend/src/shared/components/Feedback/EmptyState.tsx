'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import Link from 'next/link';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No se encontraron trámites',
  description = 'No hay registros disponibles que coincidan con los criterios seleccionados.',
  actionText,
  actionHref,
  onAction,
  icon,
}) => {
  return (
    <Box
      sx={{
        py: 8,
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: '1px dashed #cbd5e1',
        my: 2,
      }}
    >
      <Box sx={{ color: 'text.secondary', mb: 2 }}>
        {icon || <InboxOutlinedIcon sx={{ fontSize: 64, color: '#94a3b8' }} />}
      </Box>
      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mb: actionText ? 3 : 0 }}>
        {description}
      </Typography>
      {actionText && actionHref && (
        <Button component={Link} href={actionHref} variant="contained" color="primary">
          {actionText}
        </Button>
      )}
      {actionText && onAction && !actionHref && (
        <Button onClick={onAction} variant="contained" color="primary">
          {actionText}
        </Button>
      )}
    </Box>
  );
};
