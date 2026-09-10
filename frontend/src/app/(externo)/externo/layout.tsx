'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Toolbar } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { ExternalNavbar } from '@/shared/components/Navigation/ExternalNavbar';
import { ExternalSidebar } from '@/shared/components/Navigation/ExternalSidebar';
import { useAuth } from '@/shared/context/AuthContext';
import { TipoUsuario } from '@/features/auth/interfaces/auth.interface';

const PUBLIC_PATHS = ['/externo/login', '/externo/registro'];

export default function ExternoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!isLoading && !isPublic) {
      if (!isAuthenticated || user?.tipo !== TipoUsuario.EXTERNO) {
        router.replace(`/externo/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [isLoading, isPublic, isAuthenticated, user, pathname, router]);

  if (isPublic) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        <ExternalNavbar />
        <Toolbar />
        <Box component="main" sx={{ flexGrow: 1, py: 4, display: 'flex', alignItems: 'center' }}>
          {children}
        </Box>
        <Box component="footer" sx={{ py: 2, textAlign: 'center', bgcolor: 'background.paper', borderTop: '1px solid #e2e8f0' }}>
          <Typography variant="body2" color="text.secondary">
            BPM Trámites de Oficina — Portal de Autogestión Ciudadana y Proveedores
          </Typography>
        </Box>
      </Box>
    );
  }

  if (isLoading || !isAuthenticated || user?.tipo !== TipoUsuario.EXTERNO) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <ExternalNavbar onMobileToggle={handleDrawerToggle} />
      <ExternalSidebar
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
        <Toolbar />
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
            BPM Trámites de Oficina — Portal de Autogestión Ciudadana y Proveedores
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
