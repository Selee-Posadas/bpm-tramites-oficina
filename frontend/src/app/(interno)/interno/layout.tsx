'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { InternalSidebar } from '@/shared/components/Navigation/InternalSidebar';
import { InternalHeader } from '@/shared/components/Navigation/InternalHeader';
import { useAuth } from '@/shared/context/AuthContext';
import { TipoUsuario } from '@/features/auth/interfaces/auth.interface';

export default function InternoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const isPublic = pathname === '/interno/login';

  useEffect(() => {
    if (!isLoading && !isPublic) {
      if (!isAuthenticated || user?.tipo !== TipoUsuario.INTERNO) {
        router.replace(`/interno/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [isLoading, isPublic, isAuthenticated, user, pathname, router]);

  if (isPublic) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
        <Box component="main" sx={{ flexGrow: 1, py: 4, display: 'flex', alignItems: 'center' }}>
          {children}
        </Box>
        <Box component="footer" sx={{ py: 2, textAlign: 'center', bgcolor: 'background.paper', borderTop: '1px solid #e2e8f0' }}>
          <Typography variant="body2" color="text.secondary">
            BPM Trámites de Oficina — Sistema Interno Organizacional & Auditoría
          </Typography>
        </Box>
      </Box>
    );
  }

  if (isLoading || !isAuthenticated || user?.tipo !== TipoUsuario.INTERNO) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <InternalSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: '100vh',
        }}
      >
        <InternalHeader onMobileToggle={handleDrawerToggle} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: { xs: 2.5, sm: 3 },
            px: { xs: 2, sm: 3, md: 4 },
            maxWidth: 1600,
            width: '100%',
            mx: 'auto',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </Box>
        <Box
          component="footer"
          sx={{
            py: 2,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderTop: '1px solid #e2e8f0',
            mt: 'auto',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            BPM Trámites de Oficina — Sistema Interno Organizacional & Auditoría
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
