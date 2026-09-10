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
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AreaCreateModalProps } from '../interfaces/area.interface';

const createAreaValidationSchema = Yup.object({
  nombre: Yup.string().trim().required('El nombre del área es obligatorio'),
  codigo: Yup.string()
    .trim()
    .required('El código es obligatorio')
    .matches(/^[A-Z0-9_-]+$/, 'Solo mayúsculas, números y guiones'),
  activa: Yup.boolean().required(),
});

export function AreaCreateModal({
  open,
  onClose,
  onSubmit,
}: AreaCreateModalProps) {
  const formik = useFormik({
    initialValues: {
      nombre: '',
      codigo: '',
      activa: true,
    },
    validationSchema: createAreaValidationSchema,
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
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Nueva Área Organizacional</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              id="area-codigo-input"
              name="codigo"
              label="Código del Área (ej: MESA_ENTRADA)"
              fullWidth
              value={formik.values.codigo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.codigo && Boolean(formik.errors.codigo)}
              helperText={formik.touched.codigo && formik.errors.codigo}
            />
            <TextField
              id="area-nombre-input"
              name="nombre"
              label="Nombre del Área"
              fullWidth
              value={formik.values.nombre}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.nombre && Boolean(formik.errors.nombre)}
              helperText={formik.touched.nombre && formik.errors.nombre}
            />
            <FormControlLabel
              control={
                <Switch
                  id="area-activa-switch"
                  name="activa"
                  checked={formik.values.activa}
                  onChange={(e) => formik.setFieldValue('activa', e.target.checked)}
                  color="primary"
                />
              }
              label="Área Activa"
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
