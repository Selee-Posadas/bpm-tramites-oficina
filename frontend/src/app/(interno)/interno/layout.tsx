'use client';

import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { InternalNavbar } from '@/shared/components/Navigation/InternalNavbar';

export default function InternoLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <InternalNavbar />
      <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: 3, px: { xs: 2, sm: 3 } }}>
        {children}
      </Container>
      <Box component="footer" sx={{ py: 2, textAlign: 'center', bgcolor: 'background.paper', borderTop: '1px solid #e2e8f0' }}>
        <Typography variant="body2" color="text.secondary">
          BPM Trámites de Oficina — Sistema Interno Organizacional & Auditoría
        </Typography>
      </Box>
    </Box>
  );
}

