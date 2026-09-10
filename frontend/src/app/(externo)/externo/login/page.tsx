'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Link as MuiLink,
  CircularProgress,
  Alert,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/shared/context/AuthContext';
import { TipoUsuario } from '@/features/auth/interfaces/auth.interface';

export default function ExternoLoginPage() {
  const { loginExternal, isLoading, isAuthenticated, user } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.tipo === TipoUsuario.EXTERNO) {
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect') || '/externo/mis-tramites';
      window.location.href = redirect;
    }
  }, [isLoading, isAuthenticated, user]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Ingrese un email válido').required('El email es obligatorio'),
      password: Yup.string().required('La contraseña es obligatoria'),
    }),
    onSubmit: async (values) => {
      setErrorMsg('');
      try {
        await loginExternal(values.email, values.password);
        const searchParams = new URLSearchParams(window.location.search);
        const redirect = searchParams.get('redirect') || '/externo/mis-tramites';
        window.location.href = redirect;
      } catch (err: unknown) {
        setErrorMsg('Credenciales inválidas. Verifique su email y contraseña.');
      }
    },
  });

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card elevation={2} sx={{ width: '100%', borderRadius: 3, p: { xs: 2, sm: 3 } }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <PersonIcon sx={{ fontSize: 56, color: 'secondary.main', mb: 1 }} />
              <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
                Portal de Autogestión
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Inicie sesión para tramitar, responder observaciones y realizar seguimiento
              </Typography>
            </Box>

            {errorMsg && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  id="externo-login-email"
                  name="email"
                  label="Correo Electrónico"
                  placeholder="su-email@ejemplo.com"
                  fullWidth
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  autoComplete="email"
                  autoFocus
                />

                <TextField
                  id="externo-login-password"
                  name="password"
                  type="password"
                  label="Contraseña"
                  fullWidth
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  autoComplete="current-password"
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  size="large"
                  disabled={isLoading || !formik.isValid}
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                  sx={{ py: 1.5, mt: 1, fontWeight: 700 }}
                >
                  Iniciar Sesión
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    ¿Aún no tiene una cuenta ciudadana o de proveedor?{' '}
                    <MuiLink component={Link} href="/externo/registro" color="secondary" sx={{ fontWeight: 700 }}>
                      Regístrese aquí
                    </MuiLink>
                  </Typography>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
