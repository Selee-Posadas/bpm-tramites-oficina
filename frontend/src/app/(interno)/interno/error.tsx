'use client';

import React, { useEffect } from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import Link from 'next/link';

export default function InternoErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error no controlado en Portal Interno:', error);
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
        <ErrorOutlineIcon sx={{ fontSize: 72, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#991b1b' }}>
          Ocurrió un error en el Portal Interno
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          No pudimos completar la operación solicitada debido a un fallo inesperado. Los detalles del incidente han sido registrados para auditoría técnica.
        </Typography>

        {error.message && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 4,
              bgcolor: '#ffffff',
              borderColor: '#fca5a5',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              color: '#b91c1c',
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
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={() => reset()}
            size="large"
          >
            Reintentar Acción
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<HomeIcon />}
            component={Link}
            href="/interno/dashboard"
            size="large"
          >
            Ir al Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
