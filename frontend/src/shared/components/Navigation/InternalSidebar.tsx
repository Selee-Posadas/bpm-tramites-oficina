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
  Divider,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { RolInterno } from '../../../features/auth/interfaces/auth.interface';

export const DRAWER_WIDTH = 260;

import { InternalSidebarProps, NavItem } from '../../interfaces/navigation.interface';

export type { InternalSidebarProps, NavItem };

export const InternalSidebar: React.FC<InternalSidebarProps> = ({
  mobileOpen,
  onMobileClose,
}) => {
  const pathname = usePathname();
  const { user, logoutInternal, hasRole } = useAuth();
  const isAdmin = hasRole([RolInterno.ADMIN]);

  const isActive = (path: string) => {
    if (path === '/interno/dashboard') {
      return pathname === path;
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const navItemsPrincipal: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/interno/dashboard',
      icon: <DashboardOutlinedIcon />,
    },
    {
      label: 'Bandeja de Trámites',
      href: '/interno/bandeja',
      icon: <InboxOutlinedIcon />,
    },
    {
      label: 'Nuevo Trámite',
      href: '/interno/tramites/nuevo',
      icon: <AddCircleOutlineIcon />,
    },
  ];

  const navItemsAdmin: NavItem[] = [
    {
      label: 'Tipos de Trámite',
      href: '/interno/configuracion/tipos-tramite',
      icon: <CategoryOutlinedIcon />,
    },
    {
      label: 'Áreas del Sistema',
      href: '/interno/configuracion/areas',
      icon: <CorporateFareOutlinedIcon />,
    },
  ];

  const renderNavList = (items: NavItem[]) => (
    <List disablePadding sx={{ px: 1.5 }}>
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={Link}
              href={item.href}
              onClick={onMobileClose}
              sx={{
                borderRadius: 2,
                py: 1,
                px: 1.5,
                bgcolor: active ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                color: active ? 'primary.main' : 'text.secondary',
                fontWeight: active ? 600 : 500,
                borderLeft: active ? '3px solid' : '3px solid transparent',
                borderColor: active ? 'primary.main' : 'transparent',
                '&:hover': {
                  bgcolor: active ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                  color: active ? 'primary.main' : 'text.primary',
                },
                transition: 'all 0.15s ease-in-out',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: active ? 'primary.main' : 'text.secondary',
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
  );

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#ffffff',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 2.5,
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
          }}
        >
          <BusinessIcon fontSize="medium" />
        </Box>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 800, lineHeight: 1.2, color: 'text.primary', letterSpacing: '-0.3px' }}
          >
            BPM Interno
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Trámites & Auditoría
          </Typography>
        </Box>
      </Box>

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
          OPERACIONES
        </Typography>
        {renderNavList(navItemsPrincipal)}

        {isAdmin && (
          <>
            <Divider sx={{ my: 2, mx: 2 }} />
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
              ADMINISTRACIÓN
            </Typography>
            {renderNavList(navItemsAdmin)}
          </>
        )}
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
                bgcolor: 'primary.main',
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
              {user.rolInterno && (
                <Chip
                  label={user.rolInterno}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{
                    height: 18,
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    mt: 0.2,
                  }}
                />
              )}
            </Box>
          </Box>

          <Button
            variant="outlined"
            color="inherit"
            size="small"
            fullWidth
            startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
            onClick={() => logoutInternal()}
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
