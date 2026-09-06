'use client';

import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid2 as Grid,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TipoTramite } from '../../tipos-tramite/interfaces/tipo-tramite.interface';
import { CreateTramiteFormValues } from '../interfaces/tramite.interface';

interface TramiteCreateFormProps {
  tiposTramite: TipoTramite[];
  isInternal?: boolean;
  isLoading?: boolean;
  backHref: string;
  onSubmit: (values: CreateTramiteFormValues) => Promise<void>;
}

export const TramiteCreateForm: React.FC<TramiteCreateFormProps> = ({
  tiposTramite,
  isInternal = false,
  isLoading = false,
  backHref,
  onSubmit,
}) => {
  const formik = useFormik<CreateTramiteFormValues>({
    initialValues: {
      tipoTramiteId: tiposTramite.length > 0 ? tiposTramite[0].id : '',
      titulo: '',
      descripcion: '',
      prioridad: 'MEDIA',
      usuarioExternoId: '',
    },
    validationSchema: Yup.object({
      tipoTramiteId: Yup.string().required('Debe seleccionar un tipo de trámite'),
      titulo: Yup.string().trim().required('El título es obligatorio').min(5, 'Mínimo 5 caracteres'),
      descripcion: Yup.string().trim().required('La descripción es obligatoria').min(10, 'Mínimo 10 caracteres'),
      prioridad: Yup.string().oneOf(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']).required(),
      usuarioExternoId: Yup.string().optional(),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  const selectedTipo = tiposTramite.find((t) => t.id === formik.values.tipoTramiteId);

  return (
    <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, maxWidth: 800, mx: 'auto' }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button component={Link} href={backHref} startIcon={<ArrowBackIcon />} color="inherit" sx={{ mr: 2 }}>
            Volver
          </Button>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            {isInternal ? 'Iniciar Nuevo Trámite Interno' : 'Iniciar Nueva Solicitud de Trámite'}
          </Typography>
        </Box>

        {tiposTramite.length === 0 ? (
          <Alert severity="warning">
            No hay tipos de trámite habilitados para esta modalidad en este momento.
          </Alert>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  id="tramite-tipo-select"
                  name="tipoTramiteId"
                  select
                  label="Tipo de Trámite"
                  fullWidth
                  value={formik.values.tipoTramiteId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.tipoTramiteId && Boolean(formik.errors.tipoTramiteId)}
                  helperText={
                    (formik.touched.tipoTramiteId && formik.errors.tipoTramiteId) ||
                    (selectedTipo && `${selectedTipo.descripcion} (SLA base: ${selectedTipo.slaHoras} horas)`)
                  }
                >
                  {tiposTramite.map((tipo) => (
                    <MenuItem key={tipo.id} value={tipo.id}>
                      {tipo.nombre} ({tipo.codigo})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  id="tramite-titulo-input"
                  name="titulo"
                  label="Título o Asunto Principal"
                  placeholder="Ej: Solicitud de habilitación de oficinas comerciales..."
                  fullWidth
                  value={formik.values.titulo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.titulo && Boolean(formik.errors.titulo)}
                  helperText={formik.touched.titulo && formik.errors.titulo}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id="tramite-prioridad-select"
                  name="prioridad"
                  select
                  label="Nivel de Prioridad"
                  fullWidth
                  value={formik.values.prioridad}
                  onChange={formik.handleChange}
                >
                  <MenuItem value="BAJA">Baja</MenuItem>
                  <MenuItem value="MEDIA">Media</MenuItem>
                  <MenuItem value="ALTA">Alta</MenuItem>
                  <MenuItem value="URGENTE">Urgente</MenuItem>
                </TextField>
              </Grid>

              {isInternal && selectedTipo?.requiereExterno && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    id="tramite-usuario-externo-input"
                    name="usuarioExternoId"
                    label="ID de Usuario Externo Vinculado"
                    placeholder="ej: ext-1"
                    fullWidth
                    value={formik.values.usuarioExternoId}
                    onChange={formik.handleChange}
                    helperText="Requerido para trámites del Circuito Interno->Externo"
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <TextField
                  id="tramite-descripcion-input"
                  name="descripcion"
                  label="Descripción y Fundamentación Detallada"
                  placeholder="Explique detalladamente el motivo y requerimiento de este trámite..."
                  multiline
                  rows={4}
                  fullWidth
                  value={formik.values.descripcion}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.descripcion && Boolean(formik.errors.descripcion)}
                  helperText={formik.touched.descripcion && formik.errors.descripcion}
                />
              </Grid>

              <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isLoading || !formik.isValid}
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Crear e Iniciar Trámite
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
