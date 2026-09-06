'use client';

import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import Link from 'next/link';

export default function InternoLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <BusinessIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            BPM — Portal Interno
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
          BPM Trámites de Oficina — Sistema Interno Organizacional
        </Typography>
      </Box>
    </Box>
  );
}
