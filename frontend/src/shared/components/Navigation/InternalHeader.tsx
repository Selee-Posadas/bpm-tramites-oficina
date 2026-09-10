'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Divider,
  Avatar,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

import { InternalHeaderProps } from '../../interfaces/navigation.interface';

export type { InternalHeaderProps };

export const InternalHeader: React.FC<InternalHeaderProps> = ({ onMobileToggle }) => {
  const pathname = usePathname();
  const { user, logoutInternal } = useAuth();
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);

  const getPageTitle = (path: string): string => {
    if (path === '/interno/dashboard') return 'Dashboard Operativo';
    if (path === '/interno/bandeja') return 'Bandeja General de Trámites';
    if (path === '/interno/tramites/nuevo') return 'Iniciar Nuevo Trámite';
    if (path.startsWith('/interno/tramites/')) return 'Detalle de Expediente';
    if (path === '/interno/configuracion/tipos-tramite') return 'Catálogo de Tipos de Trámite';
    if (path === '/interno/configuracion/areas') return 'Áreas Organizacionales';
    return 'Portal Interno';
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 }, minHeight: 64 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            color="inherit"
            aria-label="Abrir menú de navegación"
            edge="start"
            onClick={onMobileToggle}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.05rem', sm: '1.25rem' },
              color: 'text.primary',
              letterSpacing: '-0.01em',
            }}
          >
            {getPageTitle(pathname)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {user && (
            <>
              <Tooltip title={user.nombre ? `${user.nombre} (${user.rolInterno || ''})` : 'Mi Perfil'}>
                <IconButton
                  onClick={(e) => setUserAnchor(e.currentTarget)}
                  size="small"
                  aria-label="Menú de usuario"
                  aria-controls={userAnchor ? 'user-menu' : undefined}
                  aria-haspopup="true"
                  sx={{
                    p: 0.5,
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 38,
                      height: 38,
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      boxShadow: '0 2px 6px rgba(25, 118, 210, 0.2)',
                    }}
                  >
                    {user.nombre?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={userAnchor}
                open={Boolean(userAnchor)}
                onClose={() => setUserAnchor(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    minWidth: 220,
                    borderRadius: 2,
                    mt: 1,
                    border: '1px solid #e2e8f0',
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {user.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {user.email}
                  </Typography>
                  {user.rolInterno && (
                    <Chip
                      label={user.rolInterno}
                      size="small"
                      color="primary"
                      sx={{ mt: 1, height: 20, fontSize: '0.6875rem', fontWeight: 700 }}
                    />
                  )}
                </Box>
                <Divider />
                <MenuItem
                  component={Link}
                  href="/interno/login"
                  onClick={() => setUserAnchor(null)}
                  sx={{ py: 1 }}
                >
                  <SwitchAccountIcon sx={{ mr: 1.5, fontSize: 20, color: 'text.secondary' }} />
                  Cambiar de Perfil
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    setUserAnchor(null);
                    logoutInternal();
                  }}
                  sx={{ color: 'error.main', py: 1 }}
                >
                  <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
