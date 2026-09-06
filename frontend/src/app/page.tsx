'use client';

import React from 'react';
import { Container, Box, Typography, Button, Card, CardContent, Grid } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 8, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          BPM de Trámites de Oficina
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 6 }}>
          Seleccione el portal correspondiente para ingresar al sistema
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <BusinessIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Portal Interno
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Acceso exclusivo para empleados, operadores, supervisores y administradores de la organización.
                </Typography>
                <Button
                  component={Link}
                  href="/interno/login"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                >
                  Ingresar a Portal Interno
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <PersonIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Portal Externo
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Acceso para ciudadanos, proveedores y solicitantes externos para iniciar y seguir trámites.
                </Typography>
                <Button
                  component={Link}
                  href="/externo/login"
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                >
                  Ingresar a Portal Externo
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
