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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAreas } from '@/features/areas/hooks/useAreas';
import { Area } from '@/features/areas/interfaces/area.interface';
import { LoadingSkeleton } from '@/shared/components/Feedback/LoadingSkeleton';

export default function ConfigAreasPage() {
  const { areas, isLoading, crearArea, actualizarArea } = useAreas(false);
  const [modalCreateOpen, setModalCreateOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  const createFormik = useFormik({
    initialValues: {
      nombre: '',
      codigo: '',
      activa: true,
    },
    validationSchema: Yup.object({
      nombre: Yup.string().trim().required('El nombre del área es obligatorio'),
      codigo: Yup.string().trim().required('El código es obligatorio').matches(/^[A-Z0-9_-]+$/, 'Solo mayúsculas, números y guiones'),
      activa: Yup.boolean().required(),
    }),
    onSubmit: async (values, { resetForm }) => {
      const ok = await crearArea(values);
      if (ok) {
        resetForm();
        setModalCreateOpen(false);
      }
    },
  });

  const editFormik = useFormik({
    initialValues: {
      nombre: editingArea ? editingArea.nombre : '',
      codigo: editingArea ? editingArea.codigo : '',
      activa: editingArea ? editingArea.activa : true,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      nombre: Yup.string().trim().required('El nombre del área es obligatorio'),
      codigo: Yup.string().trim().required('El código es obligatorio'),
      activa: Yup.boolean().required(),
    }),
    onSubmit: async (values) => {
      if (editingArea) {
        const ok = await actualizarArea(editingArea.id, values);
        if (ok) {
          setEditingArea(null);
        }
      }
    },
  });

  if (isLoading) {
    return <LoadingSkeleton rows={3} />;
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Configuración de Áreas Organizacionales
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Catálogo de dependencias, gerencias y sectores para derivación de trámites
          </Typography>
        </div>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setModalCreateOpen(true)}
        >
          Nueva Área
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Table sx={{ minWidth: 600 }} aria-label="tabla de areas">
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Nombre del Área</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {areas.map((area) => (
              <TableRow key={area.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{area.codigo}</TableCell>
                <TableCell>{area.nombre}</TableCell>
                <TableCell>
                  <Chip
                    label={area.activa ? 'Activa' : 'Inactiva'}
                    size="small"
                    color={area.activa ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Editar área">
                    <IconButton size="small" color="primary" onClick={() => setEditingArea(area)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalCreateOpen} onClose={() => setModalCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Nueva Área Organizacional</DialogTitle>
        <form onSubmit={createFormik.handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                id="area-codigo-input"
                name="codigo"
                label="Código del Área (ej: MESA_ENTRADA)"
                fullWidth
                value={createFormik.values.codigo}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.codigo && Boolean(createFormik.errors.codigo)}
                helperText={createFormik.touched.codigo && createFormik.errors.codigo}
              />
              <TextField
                id="area-nombre-input"
                name="nombre"
                label="Nombre del Área"
                fullWidth
                value={createFormik.values.nombre}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.nombre && Boolean(createFormik.errors.nombre)}
                helperText={createFormik.touched.nombre && createFormik.errors.nombre}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={createFormik.values.activa}
                    onChange={(e) => createFormik.setFieldValue('activa', e.target.checked)}
                    color="primary"
                  />
                }
                label="Área Activa"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setModalCreateOpen(false)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">Guardar</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={Boolean(editingArea)} onClose={() => setEditingArea(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Editar Área</DialogTitle>
        <form onSubmit={editFormik.handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                id="edit-area-codigo-input"
                name="codigo"
                label="Código"
                fullWidth
                value={editFormik.values.codigo}
                onChange={editFormik.handleChange}
                error={editFormik.touched.codigo && Boolean(editFormik.errors.codigo)}
                helperText={editFormik.touched.codigo && editFormik.errors.codigo}
              />
              <TextField
                id="edit-area-nombre-input"
                name="nombre"
                label="Nombre del Área"
                fullWidth
                value={editFormik.values.nombre}
                onChange={editFormik.handleChange}
                error={editFormik.touched.nombre && Boolean(editFormik.errors.nombre)}
                helperText={editFormik.touched.nombre && editFormik.errors.nombre}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormik.values.activa}
                    onChange={(e) => editFormik.setFieldValue('activa', e.target.checked)}
                    color="primary"
                  />
                }
                label="Área Activa"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setEditingArea(null)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">Actualizar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
