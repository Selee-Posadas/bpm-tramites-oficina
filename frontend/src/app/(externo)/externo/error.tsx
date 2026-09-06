'use client';

import React, { useEffect } from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';

export default function ExternoErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error no controlado en Portal Externo:', error);
  }, [error]);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 5,
          textAlign: 'center',
          borderRadius: 4,
          border: '1px solid #fecaca',
          bgcolor: '#fffbfb',
        }}
      >
        <ReportProblemOutlinedIcon sx={{ fontSize: 72, color: 'secondary.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'secondary.dark' }}>
          Lo sentimos, ha ocurrido un problema
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          La página no pudo procesar su solicitud en este momento. Puede reintentar la acción o volver a la bandeja de sus trámites.
        </Typography>

        {error.message && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 4,
              bgcolor: '#ffffff',
              borderColor: '#e2e8f0',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              color: '#475569',
              textAlign: 'left',
              overflowX: 'auto',
            }}
          >
            {error.message}
          </Paper>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={() => reset()}
            size="large"
          >
            Reintentar
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ArrowBackIcon />}
            component={Link}
            href="/externo/mis-tramites"
            size="large"
          >
            Ir a Mis Trámites
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
