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
import { AreaEditModalProps } from '../interfaces/area.interface';

const editAreaValidationSchema = Yup.object({
  nombre: Yup.string().trim().required('El nombre del área es obligatorio'),
  codigo: Yup.string().trim().required('El código es obligatorio'),
  activa: Yup.boolean().required(),
});

export function AreaEditModal({
  open,
  area,
  onClose,
  onSubmit,
}: AreaEditModalProps) {
  const formik = useFormik({
    initialValues: {
      nombre: area ? area.nombre : '',
      codigo: area ? area.codigo : '',
      activa: area ? area.activa : true,
    },
    enableReinitialize: true,
    validationSchema: editAreaValidationSchema,
    onSubmit: async (values) => {
      if (area) {
        const ok = await onSubmit(area.id, values);
        if (ok) {
          onClose();
        }
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Editar {area?.nombre || 'Área'}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              id="edit-area-codigo-input"
              name="codigo"
              label="Código"
              fullWidth
              value={formik.values.codigo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.codigo && Boolean(formik.errors.codigo)}
              helperText={formik.touched.codigo && formik.errors.codigo}
            />
            <TextField
              id="edit-area-nombre-input"
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
                  id="edit-area-activa-switch"
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
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={formik.isSubmitting}
          >
            Actualizar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
