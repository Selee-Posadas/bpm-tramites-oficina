'use client';

import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Avatar,
  Button,
  Toolbar,
  Divider,
} from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ExternalSidebarProps, NavItem } from '../../interfaces/navigation.interface';

export const DRAWER_WIDTH = 260;

export type { ExternalSidebarProps };

export const ExternalSidebar: React.FC<ExternalSidebarProps> = ({
  mobileOpen,
  onMobileClose,
}) => {
  const pathname = usePathname();
  const { user, logoutExternal } = useAuth();

  const isActive = (path: string) => {
    if (path === '/externo/mis-tramites') {
      return pathname === '/externo/mis-tramites' || pathname === '/externo' || (pathname.startsWith('/externo/tramites/') && pathname !== '/externo/tramites/nuevo');
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const navItems: NavItem[] = [
    {
      label: 'Mis Trámites',
      href: '/externo/mis-tramites',
      icon: <InboxOutlinedIcon />,
    },
    {
      label: 'Iniciar Nuevo Trámite',
      href: '/externo/tramites/nuevo',
      icon: <AddCircleOutlineIcon />,
    },
  ];

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#ffffff',
      }}
    >
      <Toolbar />

      <Box sx={{ flexGrow: 1, py: 2, overflowY: 'auto' }}>
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            px: 2.5,
            mb: 1,
            color: 'text.secondary',
            fontWeight: 700,
            letterSpacing: '0.5px',
            fontSize: '0.6875rem',
          }}
        >
          GESTIÓN CIUDADANA
        </Typography>

        <List disablePadding sx={{ px: 1.5 }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={onMobileClose}
                  sx={{
                    borderRadius: 2,
                    py: 1.1,
                    px: 1.5,
                    bgcolor: active ? 'rgba(123, 31, 162, 0.08)' : 'transparent',
                    color: active ? 'secondary.main' : 'text.secondary',
                    fontWeight: active ? 600 : 500,
                    borderLeft: active ? '3px solid' : '3px solid transparent',
                    borderColor: active ? 'secondary.main' : 'transparent',
                    '&:hover': {
                      bgcolor: active ? 'rgba(123, 31, 162, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                      color: active ? 'secondary.main' : 'text.primary',
                    },
                    transition: 'all 0.15s ease-in-out',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: active ? 'secondary.main' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: active ? 700 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {user && (
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid #e2e8f0',
            bgcolor: '#f8fafc',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: 'secondary.main',
                color: '#ffffff',
                width: 38,
                height: 38,
                fontSize: '0.875rem',
                fontWeight: 700,
              }}
            >
              {user.nombre?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ overflow: 'hidden', flexGrow: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'text.primary',
                }}
              >
                {user.nombre}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block',
                }}
              >
                {user.email}
              </Typography>
              <Chip
                label="Ciudadano / Proveedor"
                size="small"
                color="secondary"
                variant="outlined"
                sx={{
                  height: 18,
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  mt: 0.5,
                }}
              />
            </Box>
          </Box>

          <Button
            variant="outlined"
            color="inherit"
            size="small"
            fullWidth
            startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
            onClick={() => logoutExternal()}
            sx={{
              color: 'text.secondary',
              borderColor: '#cbd5e1',
              fontSize: '0.75rem',
              fontWeight: 600,
              py: 0.6,
              '&:hover': {
                borderColor: 'error.main',
                color: 'error.main',
                bgcolor: '#fff1f2',
              },
            }}
          >
            Cerrar Sesión
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid #e2e8f0',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid #e2e8f0',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};
