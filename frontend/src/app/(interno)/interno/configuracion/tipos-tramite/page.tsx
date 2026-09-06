'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTiposTramite } from '@/features/tipos-tramite/hooks/useTiposTramite';
import { useAreas } from '@/features/areas/hooks/useAreas';
import { TipoTramite } from '@/features/tipos-tramite/interfaces/tipo-tramite.interface';
import { LoadingSkeleton } from '@/shared/components/Feedback/LoadingSkeleton';

export default function ConfigTiposTramitePage() {
  const { tiposTramite, isLoading, crear, actualizar } = useTiposTramite(false);
  const { areas } = useAreas();
  const [modalCreateOpen, setModalCreateOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoTramite | null>(null);

  const createFormik = useFormik({
    initialValues: {
      codigo: '',
      nombre: '',
      descripcion: '',
      slaHoras: 24,
      areaInicialId: areas.length > 0 ? areas[0].id : '',
      requiereExterno: false,
      permiteInicioExterno: true,
      activo: true,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      codigo: Yup.string().trim().required('El código es obligatorio').matches(/^[A-Z0-9_-]+$/, 'Solo mayúsculas, números y guiones'),
      nombre: Yup.string().trim().required('El nombre es obligatorio'),
      descripcion: Yup.string().trim().required('La descripción es obligatoria'),
      slaHoras: Yup.number().positive('Debe ser mayor a 0').required(),
      areaInicialId: Yup.string().required('El área inicial es obligatoria'),
    }),
    onSubmit: async (values, { resetForm }) => {
      const ok = await crear(values);
      if (ok) {
        resetForm();
        setModalCreateOpen(false);
      }
    },
  });

  const editFormik = useFormik({
    initialValues: {
      slaHoras: editingTipo ? editingTipo.slaHoras : 24,
      activo: editingTipo ? editingTipo.activo : true,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      slaHoras: Yup.number().positive('Debe ser mayor a 0').required(),
      activo: Yup.boolean().required(),
    }),
    onSubmit: async (values) => {
      if (editingTipo) {
        const ok = await actualizar(editingTipo.id, values);
        if (ok) {
          setEditingTipo(null);
        }
      }
    },
  });

  if (isLoading) {
    return <LoadingSkeleton rows={4} />;
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Configuración de Tipos de Trámite
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administración del catálogo, parámetros de SLA y habilitación de circuitos
          </Typography>
        </div>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setModalCreateOpen(true)}
        >
          Nuevo Tipo de Trámite
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Table sx={{ minWidth: 700 }} aria-label="tabla de tipos de tramite">
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>SLA Base</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Inicio Externo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Requiere Externo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tiposTramite.map((tipo) => (
              <TableRow key={tipo.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{tipo.codigo}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{tipo.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary">{tipo.descripcion}</Typography>
                </TableCell>
                <TableCell>{tipo.slaHoras} horas</TableCell>
                <TableCell>
                  <Chip
                    label={tipo.permiteInicioExterno ? 'Habilitado' : 'No'}
                    size="small"
                    color={tipo.permiteInicioExterno ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={tipo.requiereExterno ? 'Sí' : 'No'}
                    size="small"
                    color={tipo.requiereExterno ? 'info' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={tipo.activo ? 'Activo' : 'Inactivo'}
                    size="small"
                    color={tipo.activo ? 'primary' : 'error'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Editar configuración">
                    <IconButton size="small" color="primary" onClick={() => setEditingTipo(tipo)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalCreateOpen} onClose={() => setModalCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Crear Nuevo Tipo de Trámite</DialogTitle>
        <form onSubmit={createFormik.handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                id="tipo-codigo-input"
                name="codigo"
                label="Código Unívoco (ej: HABILITACION_COMERCIAL)"
                fullWidth
                value={createFormik.values.codigo}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.codigo && Boolean(createFormik.errors.codigo)}
                helperText={createFormik.touched.codigo && createFormik.errors.codigo}
              />
              <TextField
                id="tipo-nombre-input"
                name="nombre"
                label="Nombre Público del Trámite"
                fullWidth
                value={createFormik.values.nombre}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.nombre && Boolean(createFormik.errors.nombre)}
                helperText={createFormik.touched.nombre && createFormik.errors.nombre}
              />
              <TextField
                id="tipo-descripcion-input"
                name="descripcion"
                label="Descripción y Alcance"
                multiline
                rows={3}
                fullWidth
                value={createFormik.values.descripcion}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.descripcion && Boolean(createFormik.errors.descripcion)}
                helperText={createFormik.touched.descripcion && createFormik.errors.descripcion}
              />
              <TextField
                id="tipo-sla-input"
                name="slaHoras"
                type="number"
                label="SLA Base (Horas)"
                fullWidth
                value={createFormik.values.slaHoras}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.slaHoras && Boolean(createFormik.errors.slaHoras)}
                helperText={createFormik.touched.slaHoras && createFormik.errors.slaHoras}
              />
              <TextField
                id="tipo-area-select"
                name="areaInicialId"
                select
                label="Área Inicial Responsable"
                fullWidth
                value={createFormik.values.areaInicialId}
                onChange={createFormik.handleChange}
              >
                {areas.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.nombre}
                  </MenuItem>
                ))}
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={createFormik.values.permiteInicioExterno}
                    onChange={(e) => createFormik.setFieldValue('permiteInicioExterno', e.target.checked)}
                  />
                }
                label="Permite inicio desde el portal externo"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={createFormik.values.requiereExterno}
                    onChange={(e) => createFormik.setFieldValue('requiereExterno', e.target.checked)}
                  />
                }
                label="Circuito requiere interacción con externo"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setModalCreateOpen(false)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">Guardar</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={Boolean(editingTipo)} onClose={() => setEditingTipo(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Editar {editingTipo?.nombre}</DialogTitle>
        <form onSubmit={editFormik.handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                id="edit-sla-input"
                name="slaHoras"
                type="number"
                label="SLA Base (Horas)"
                fullWidth
                value={editFormik.values.slaHoras}
                onChange={editFormik.handleChange}
                error={editFormik.touched.slaHoras && Boolean(editFormik.errors.slaHoras)}
                helperText={editFormik.touched.slaHoras && editFormik.errors.slaHoras}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormik.values.activo}
                    onChange={(e) => editFormik.setFieldValue('activo', e.target.checked)}
                    color="primary"
                  />
                }
                label="Activo en catálogo"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setEditingTipo(null)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">Actualizar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
