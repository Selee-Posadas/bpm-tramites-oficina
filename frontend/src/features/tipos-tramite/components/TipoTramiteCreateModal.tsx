'use client';

import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TipoTramiteCreateModalProps } from '../interfaces/tipo-tramite.interface';

const createValidationSchema = Yup.object({
  codigo: Yup.string()
    .trim()
    .required('El código es obligatorio')
    .matches(/^[A-Z0-9_-]+$/, 'Solo mayúsculas, números y guiones'),
  nombre: Yup.string().trim().required('El nombre es obligatorio'),
  descripcion: Yup.string().trim().required('La descripción es obligatoria'),
  slaHoras: Yup.number().positive('Debe ser mayor a 0').required('El SLA es obligatorio'),
  areaInicialId: Yup.string().required('El área inicial es obligatoria'),
  requiereExterno: Yup.boolean().required(),
  permiteInicioExterno: Yup.boolean().required(),
  activo: Yup.boolean().required(),
});

export function TipoTramiteCreateModal({
  open,
  areas,
  onClose,
  onSubmit,
}: TipoTramiteCreateModalProps) {
  const formik = useFormik({
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
    validationSchema: createValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      const ok = await onSubmit(values);
      if (ok) {
        resetForm();
        onClose();
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Crear Nuevo Tipo de Trámite</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              id="tipo-codigo-input"
              name="codigo"
              label="Código Unívoco (ej: HABILITACION_COMERCIAL)"
              fullWidth
              value={formik.values.codigo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.codigo && Boolean(formik.errors.codigo)}
              helperText={formik.touched.codigo && formik.errors.codigo}
            />
            <TextField
              id="tipo-nombre-input"
              name="nombre"
              label="Nombre Público del Trámite"
              fullWidth
              value={formik.values.nombre}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.nombre && Boolean(formik.errors.nombre)}
              helperText={formik.touched.nombre && formik.errors.nombre}
            />
            <TextField
              id="tipo-descripcion-input"
              name="descripcion"
              label="Descripción y Alcance"
              multiline
              rows={3}
              fullWidth
              value={formik.values.descripcion}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.descripcion && Boolean(formik.errors.descripcion)}
              helperText={formik.touched.descripcion && formik.errors.descripcion}
            />
            <TextField
              id="tipo-sla-input"
              name="slaHoras"
              type="number"
              label="SLA Base (Horas)"
              fullWidth
              value={formik.values.slaHoras}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.slaHoras && Boolean(formik.errors.slaHoras)}
              helperText={formik.touched.slaHoras && formik.errors.slaHoras}
            />
            <TextField
              id="tipo-area-select"
              name="areaInicialId"
              select
              label="Área Inicial Responsable"
              fullWidth
              value={formik.values.areaInicialId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.areaInicialId && Boolean(formik.errors.areaInicialId)}
              helperText={formik.touched.areaInicialId && formik.errors.areaInicialId}
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
                  id="tipo-permite-inicio-switch"
                  name="permiteInicioExterno"
                  checked={formik.values.permiteInicioExterno}
                  onChange={(e) => formik.setFieldValue('permiteInicioExterno', e.target.checked)}
                />
              }
              label="Permite inicio desde el portal externo"
            />
            <FormControlLabel
              control={
                <Switch
                  id="tipo-requiere-externo-switch"
                  name="requiereExterno"
                  checked={formik.values.requiereExterno}
                  onChange={(e) => formik.setFieldValue('requiereExterno', e.target.checked)}
                />
              }
              label="Circuito requiere interacción con externo"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={formik.isSubmitting}
          >
            Guardar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
