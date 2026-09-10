'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Divider,
  Grid2 as Grid,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import LoginIcon from '@mui/icons-material/Login';
import KeyIcon from '@mui/icons-material/Key';
import { useAuth } from '@/shared/context/AuthContext';
import { RolInterno, TipoUsuario } from '@/features/auth/interfaces/auth.interface';

const mockUsers = [
  { email: 'admin@bpm.local', nombre: 'Admin General', rol: RolInterno.ADMIN, desc: 'Control total del sistema y catálogos' },
  { email: 'mesa@bpm.local', nombre: 'Mesa de Entrada', rol: RolInterno.MESA_ENTRADA, desc: 'Recepción y revisión formal' },
  { email: 'operador1@bpm.local', nombre: 'Operador Mesa', rol: RolInterno.OPERADOR, desc: 'Gestión y resolución en Mesa de Entrada' },
  { email: 'supervisor@bpm.local', nombre: 'Supervisor General', rol: RolInterno.SUPERVISOR, desc: 'Reasignaciones y supervisión de SLA' },
  { email: 'auditor@bpm.local', nombre: 'Auditor Interno', rol: RolInterno.AUDITOR, desc: 'Solo lectura y fiscalización' },
];

export default function InternoLoginPage() {
  const { loginInternal, isLoading, isAuthenticated, user } = useAuth();
  const [customEmail, setCustomEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (email: string, rol?: string) => {
    setErrorMsg('');
    try {
      await loginInternal(email, rol);
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect') || '/interno/dashboard';
      window.location.href = redirect;
    } catch (err: unknown) {
      setErrorMsg('No se pudo autenticar con el usuario seleccionado. Verifique que el backend esté operativo.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card elevation={2} sx={{ width: '100%', borderRadius: 3, p: { xs: 2, sm: 3 } }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <BusinessIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
              <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
                Portal Interno — Autenticación Corporativa
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Emulación segura OIDC / Azure Entra ID para entorno de evaluación y desarrollo
              </Typography>
            </Box>

            {isAuthenticated && user && user.tipo === TipoUsuario.INTERNO && (
              <Alert
                severity="info"
                sx={{ mb: 3 }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    component={Link}
                    href="/interno/dashboard"
                    sx={{ fontWeight: 700 }}
                  >
                    Ir al Dashboard
                  </Button>
                }
              >
                Sesión activa actual: <strong>{user.nombre}</strong> ({user.rolInterno}). Puede continuar o seleccionar otro perfil abajo para cambiar de usuario:
              </Alert>
            )}

            {errorMsg && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMsg}
              </Alert>
            )}

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}>
              Seleccione un perfil institucional preconfigurado para ingresar:
            </Typography>

            <Grid container spacing={2} sx={{ mb: 4 }}>
              {mockUsers.map((u) => (
                <Grid size={{ xs: 12, sm: 6 }} key={u.email}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: '#f0f7ff',
                        transform: 'translateY(-2px)',
                        boxShadow: 1,
                      },
                    }}
                    onClick={() => !isLoading && handleLogin(u.email, u.rol)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {u.nombre}
                      </Typography>
                      <Chip label={u.rol} size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.6875rem' }} />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {u.email}
                    </Typography>
                    <Typography variant="caption" color="text.primary" sx={{ mt: 0.5, display: 'block', fontStyle: 'italic' }}>
                      {u.desc}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                O INGRESE CON OTRO CORREO CORPORATIVO
              </Typography>
            </Divider>

            <Box sx={{ display: 'flex', gap: 2, maxWidth: 500, mx: 'auto' }}>
              <TextField
                id="custom-internal-email"
                name="customEmail"
                label="Correo Institucional"
                placeholder="usuario@bpm.local"
                size="small"
                fullWidth
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => customEmail.trim() && handleLogin(customEmail.trim())}
                disabled={isLoading || !customEmail.trim()}
                startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Ingresar
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
