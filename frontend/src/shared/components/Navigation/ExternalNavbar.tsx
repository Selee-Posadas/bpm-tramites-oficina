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
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import InboxIcon from '@mui/icons-material/Inbox';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export const ExternalNavbar: React.FC = () => {
  const { user, isAuthenticated, logoutExternal } = useAuth();
  const pathname = usePathname();
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <AppBar position="sticky" color="secondary" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
            }}
          >
            Portal Ciudadano y Proveedores
          </Typography>

          {isAuthenticated && (
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, ml: 4, gap: 1 }}>
              <Button
                component={Link}
                href="/externo/mis-tramites"
                color="inherit"
                startIcon={<InboxIcon />}
                sx={{
                  bgcolor: isActive('/externo/mis-tramites') ? 'rgba(255,255,255,0.15)' : 'transparent',
                }}
              >
                Mis Trámites
              </Button>
              <Button
                component={Link}
                href="/externo/tramites/nuevo"
                color="inherit"
                startIcon={<AddCircleOutlineIcon />}
                sx={{
                  bgcolor: isActive('/externo/tramites/nuevo') ? 'rgba(255,255,255,0.15)' : 'transparent',
                }}
              >
                Iniciar Nuevo Trámite
              </Button>
            </Box>
          )}
        </Box>

        {isAuthenticated && user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user.nombre}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {user.email}
              </Typography>
            </Box>

            <IconButton
              color="inherit"
              onClick={(e) => setUserAnchor(e.currentTarget)}
              aria-label="Menú de usuario"
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
                  logoutExternal();
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
