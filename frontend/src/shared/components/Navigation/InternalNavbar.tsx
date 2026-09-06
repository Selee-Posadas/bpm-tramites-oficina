'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Divider,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InboxIcon from '@mui/icons-material/Inbox';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { RolInterno } from '../../../features/auth/interfaces/auth.interface';

export const InternalNavbar: React.FC = () => {
  const { user, isAuthenticated, logoutInternal, hasRole } = useAuth();
  const pathname = usePathname();
  const [configAnchor, setConfigAnchor] = useState<null | HTMLElement>(null);
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);

  const isAdmin = hasRole([RolInterno.ADMIN]);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <AppBar position="sticky" color="primary" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ mr: 1.5, fontSize: 28 }} />
          <Typography
            variant="h6"
            component={Link}
            href="/interno/dashboard"
            sx={{
              fontWeight: 700,
              textDecoration: 'none',
              color: 'inherit',
              letterSpacing: '-0.5px',
            }}
          >
            BPM Interno
          </Typography>

          {isAuthenticated && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 4, gap: 1 }}>
              <Button
                component={Link}
                href="/interno/dashboard"
                color="inherit"
                startIcon={<DashboardIcon />}
                sx={{
                  bgcolor: isActive('/interno/dashboard') ? 'rgba(255,255,255,0.15)' : 'transparent',
                }}
              >
                Dashboard
              </Button>
              <Button
                component={Link}
                href="/interno/bandeja"
                color="inherit"
                startIcon={<InboxIcon />}
                sx={{
                  bgcolor: isActive('/interno/bandeja') ? 'rgba(255,255,255,0.15)' : 'transparent',
                }}
              >
                Bandeja
              </Button>
              <Button
                component={Link}
                href="/interno/tramites/nuevo"
                color="inherit"
                startIcon={<AddCircleOutlineIcon />}
                sx={{
                  bgcolor: isActive('/interno/tramites/nuevo') ? 'rgba(255,255,255,0.15)' : 'transparent',
                }}
              >
                Nuevo Trámite
              </Button>

              {isAdmin && (
                <>
                  <Button
                    color="inherit"
                    startIcon={<SettingsIcon />}
                    onClick={(e) => setConfigAnchor(e.currentTarget)}
                    sx={{
                      bgcolor: isActive('/interno/configuracion') ? 'rgba(255,255,255,0.15)' : 'transparent',
                    }}
                  >
                    Configuración
                  </Button>
                  <Menu
                    anchorEl={configAnchor}
                    open={Boolean(configAnchor)}
                    onClose={() => setConfigAnchor(null)}
                  >
                    <MenuItem
                      component={Link}
                      href="/interno/configuracion/tipos-tramite"
                      onClick={() => setConfigAnchor(null)}
                    >
                      Tipos de Trámite
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      href="/interno/configuracion/areas"
                      onClick={() => setConfigAnchor(null)}
                    >
                      Áreas Organizacionales
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          )}
        </Box>

        {isAuthenticated && user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user.nombre}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', mt: 0.2 }}>
                {user.rolInterno && (
                  <Chip
                    label={user.rolInterno}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      bgcolor: 'rgba(255,255,255,0.25)',
                      color: '#ffffff',
                    }}
                  />
                )}
              </Box>
            </Box>

            <IconButton
              color="inherit"
              onClick={(e) => setUserAnchor(e.currentTarget)}
              aria-label="Perfil de usuario"
            >
              <AccountCircleIcon fontSize="large" />
            </IconButton>

            <Menu
              anchorEl={userAnchor}
              open={Boolean(userAnchor)}
              onClose={() => setUserAnchor(null)}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {user.nombre}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                onClick={() => {
                  setUserAnchor(null);
                  logoutInternal();
                }}
                sx={{ color: 'error.main' }}
              >
                <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        )}

        {!isAuthenticated && (
          <Button component={Link} href="/interno/login" color="inherit">
            Iniciar Sesión
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};
