'use client';

import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import Link from 'next/link';

export default function ExternoLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="secondary" elevation={1}>
        <Toolbar>
          <PersonIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            BPM — Portal de Trámites Externos
          </Typography>
          <Button component={Link} href="/" color="inherit">
            Inicio
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
      <Box component="footer" sx={{ py: 2, textAlign: 'center', bgcolor: 'background.paper', borderTop: '1px solid #e2e8f0' }}>
        <Typography variant="body2" color="text.secondary">
          BPM Trámites de Oficina — Portal de Autogestión Ciudadana y Proveedores
        </Typography>
      </Box>
    </Box>
  );
}
