'use client';

import React from 'react';
import { Container, Box, Card, CardContent, Typography, Button } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';

export default function InternoLoginPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card sx={{ width: '100%', p: 3 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <BusinessIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              Acceso a Portal Interno
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Autenticación corporativa vía Azure Entra ID / Mock Seguro de Desarrollo
            </Typography>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              Iniciar Sesión con Cuenta Corporativa
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
