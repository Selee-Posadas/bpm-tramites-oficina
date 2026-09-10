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
import { TipoTramiteEditModalProps } from '../interfaces/tipo-tramite.interface';

const editValidationSchema = Yup.object({
  slaHoras: Yup.number().positive('Debe ser mayor a 0').required('El SLA es obligatorio'),
  activo: Yup.boolean().required(),
});

export function TipoTramiteEditModal({
  open,
  tipo,
  onClose,
  onSubmit,
}: TipoTramiteEditModalProps) {
  const formik = useFormik({
    initialValues: {
      slaHoras: tipo ? tipo.slaHoras : 24,
      activo: tipo ? tipo.activo : true,
    },
    enableReinitialize: true,
    validationSchema: editValidationSchema,
    onSubmit: async (values) => {
      if (tipo) {
        const ok = await onSubmit(tipo.id, values);
        if (ok) {
          onClose();
        }
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Editar {tipo?.nombre || 'Tipo de Trámite'}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              id="edit-sla-input"
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
            <FormControlLabel
              control={
                <Switch
                  id="edit-activo-switch"
                  name="activo"
                  checked={formik.values.activo}
                  onChange={(e) => formik.setFieldValue('activo', e.target.checked)}
                  color="primary"
                />
              }
              label="Activo en catálogo"
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
