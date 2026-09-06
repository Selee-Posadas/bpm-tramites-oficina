'use client';

import React from 'react';
import { Container, Box, Card, CardContent, Typography, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

export default function ExternoLoginPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card sx={{ width: '100%', p: 3 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 50, color: 'secondary.main', mb: 2 }} />
            <Typography component="h1" variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              Acceso a Portal Externo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Ingrese con sus credenciales de usuario externo o regístrese para operar
            </Typography>

            <Button
              variant="contained"
              color="secondary"
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
