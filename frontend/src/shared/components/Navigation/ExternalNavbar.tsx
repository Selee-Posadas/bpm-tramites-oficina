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
  Divider,
  Avatar,
  Tooltip,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { ExternalNavbarProps } from '../../interfaces/navigation.interface';

export type { ExternalNavbarProps };

export const ExternalNavbar: React.FC<ExternalNavbarProps> = ({ onMobileToggle }) => {
  const { user, isAuthenticated, logoutExternal } = useAuth();
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);

  return (
    <AppBar
      position="fixed"
      color="secondary"
      elevation={1}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isAuthenticated && (
            <IconButton
              color="inherit"
              aria-label="Abrir menú de navegación"
              edge="start"
              onClick={onMobileToggle}
              sx={{ display: { md: 'none' }, mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <PersonIcon sx={{ mr: 1.5, fontSize: 28 }} />
          <Typography
            variant="h6"
            component={Link}
            href="/externo/mis-tramites"
            sx={{
              fontWeight: 700,
              textDecoration: 'none',
              color: 'inherit',
              letterSpacing: '-0.5px',
              fontSize: { xs: '1.05rem', sm: '1.25rem' },
            }}
          >
            Portal Ciudadano y Proveedores
          </Typography>
        </Box>

        {isAuthenticated && user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={user.nombre ? `${user.nombre} (Ciudadano / Proveedor)` : 'Mi Cuenta'}>
              <IconButton
                color="inherit"
                onClick={(e) => setUserAnchor(e.currentTarget)}
                aria-label="Menú de usuario"
                aria-controls={userAnchor ? 'external-user-menu' : undefined}
                aria-haspopup="true"
                sx={{
                  p: 0.5,
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)' },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    width: 38,
                    height: 38,
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    border: '2px solid rgba(255, 255, 255, 0.6)',
                  }}
                >
                  {user.nombre?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              id="external-user-menu"
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
                <Chip
                  label="Ciudadano / Proveedor"
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ mt: 1, height: 20, fontSize: '0.6875rem', fontWeight: 700 }}
                />
              </Box>
              <Divider />
              <MenuItem
                onClick={() => {
                  setUserAnchor(null);
                  logoutExternal();
                }}
                sx={{ color: 'error.main', py: 1 }}
              >
                <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        )}

        {!isAuthenticated && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button component={Link} href="/externo/login" color="inherit">
              Ingresar
            </Button>
            <Button component={Link} href="/externo/registro" variant="outlined" color="inherit">
              Registrarse
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
