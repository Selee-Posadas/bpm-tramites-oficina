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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/shared/context/AuthContext';
import { useNotification } from '@/shared/context/NotificationContext';
import { TipoUsuario } from '@/features/auth/interfaces/auth.interface';

export default function ExternoRegistroPage() {
  const { registerExternal, isLoading, isAuthenticated, user } = useAuth();
  const { showSuccess } = useNotification();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.tipo === TipoUsuario.EXTERNO) {
      window.location.href = '/externo/mis-tramites';
    }
  }, [isLoading, isAuthenticated, user]);

  const formik = useFormik({
    initialValues: {
      nombre: '',
      email: '',
      password: '',
      documento: '',
      organizacion: '',
    },
    validationSchema: Yup.object({
      nombre: Yup.string().trim().required('El nombre completo es obligatorio').min(3, 'Mínimo 3 caracteres'),
      email: Yup.string().email('Ingrese un email válido').required('El email es obligatorio'),
      password: Yup.string().required('La contraseña es obligatoria').min(6, 'Mínimo 6 caracteres'),
      documento: Yup.string().trim().required('El documento (DNI o CUIT) es obligatorio'),
      organizacion: Yup.string().trim().optional(),
    }),
    onSubmit: async (values) => {
      setErrorMsg('');
      try {
        await registerExternal(values);
        showSuccess('Registro completado exitosamente. ¡Bienvenido al portal!');
        window.location.href = '/externo/mis-tramites';
      } catch (err: unknown) {
        setErrorMsg('No se pudo completar el registro. Es posible que el correo ya esté registrado.');
      }
    },
  });

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card elevation={2} sx={{ width: '100%', borderRadius: 3, p: { xs: 2, sm: 3 } }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <PersonAddIcon sx={{ fontSize: 56, color: 'secondary.main', mb: 1 }} />
              <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
                Registro de Usuario Externo
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Cree su cuenta para operar con la institución como ciudadano o proveedor
              </Typography>
            </Box>

            {errorMsg && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  id="registro-nombre-input"
                  name="nombre"
                  label="Nombre Completo o Razón Social"
                  placeholder="Ej: Juan Pérez / Empresa SRL"
                  fullWidth
                  value={formik.values.nombre}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                  helperText={formik.touched.nombre && formik.errors.nombre}
                  autoFocus
                />

                <TextField
                  id="registro-documento-input"
                  name="documento"
                  label="DNI o CUIT"
                  placeholder="Ej: 30-12345678-9 o 35123456"
                  fullWidth
                  value={formik.values.documento}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.documento && Boolean(formik.errors.documento)}
                  helperText={formik.touched.documento && formik.errors.documento}
                />

                <TextField
                  id="registro-organizacion-input"
                  name="organizacion"
                  label="Organización / Empresa (Opcional)"
                  placeholder="Ej: Constructora del Litoral"
                  fullWidth
                  value={formik.values.organizacion}
                  onChange={formik.handleChange}
                />

                <TextField
                  id="registro-email-input"
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
                />

                <TextField
                  id="registro-password-input"
                  name="password"
                  type="password"
                  label="Contraseña"
                  fullWidth
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  autoComplete="new-password"
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  size="large"
                  disabled={isLoading || !formik.isValid}
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
                  sx={{ py: 1.5, mt: 1, fontWeight: 700 }}
                >
                  Registrarse e Ingresar
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    ¿Ya tiene una cuenta creada?{' '}
                    <MuiLink component={Link} href="/externo/login" color="secondary" sx={{ fontWeight: 700 }}>
                      Inicie sesión
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
