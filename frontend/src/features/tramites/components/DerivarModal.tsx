'use client';

import React from 'react';
import {
  Button,
  Dialog,
  MenuItem,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { DerivarModalProps } from '../interfaces/tramite.interface';

export function DerivarModal({
  open,
  areas,
  areaActualId,
  isLoading = false,
  onClose,
  onConfirm,
}: DerivarModalProps) {
  const areasDisponibles = areas.filter((a) => a.id !== areaActualId && a.activa);

  const formik = useFormik({
    initialValues: {
      areaDestinoId: areasDisponibles.length > 0 ? areasDisponibles[0].id : '',
      motivo: '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      areaDestinoId: Yup.string().required('Debe seleccionar el área de destino'),
      motivo: Yup.string().trim().required('El motivo de la derivación es obligatorio'),
    }),
    onSubmit: async (values, { resetForm }) => {
      const ok = await onConfirm(values.areaDestinoId, values.motivo.trim());
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
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          px: { xs: 2.5, sm: 3.5 },
          py: { xs: 3, sm: 3.5 },
          width: '100%',
          maxWidth: 440,
          mx: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          textAlign: 'center',
        },
      }}
    >
      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <AltRouteIcon color="secondary" sx={{ fontSize: 62, mb: 1.5 }} />

          <Typography
            id="derivar-modal-title"
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 700,
              fontSize: '1.25rem',
              color: 'secondary.main',
              textAlign: 'center',
              lineHeight: 1.3,
              mb: 1.5,
            }}
          >
            Derivar Trámite a Otra Área
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontSize: '0.95rem',
              textAlign: 'center',
              lineHeight: 1.5,
              mb: 2.5,
              px: 0.5,
            }}
          >
            Seleccione el área destino y exponga el motivo formal de la derivación inter-área.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', mb: 3, textAlign: 'left' }}>
            <TextField
              id="derivar-area-select"
              name="areaDestinoId"
              select
              label="Área de Destino"
              fullWidth
              value={formik.values.areaDestinoId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.areaDestinoId && Boolean(formik.errors.areaDestinoId)}
              helperText={formik.touched.areaDestinoId && formik.errors.areaDestinoId}
            >
              {areasDisponibles.map((area) => (
                <MenuItem key={area.id} value={area.id}>
                  {area.nombre} ({area.codigo})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              id="derivar-motivo-input"
              name="motivo"
              label="Motivo de la Derivación (Obligatorio)"
              multiline
              rows={3}
              fullWidth
              value={formik.values.motivo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.motivo && Boolean(formik.errors.motivo)}
              helperText={formik.touched.motivo && formik.errors.motivo}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, width: '100%' }}>
            <Button
              onClick={handleClose}
              disabled={isLoading}
              variant="outlined"
              color="inherit"
              sx={{
                minWidth: 110,
                py: 1,
                px: 2.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '0.95rem',
                textTransform: 'none',
                borderColor: '#cbd5e1',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: '#94a3b8',
                  bgcolor: '#f8fafc',
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={isLoading || formik.isSubmitting}
              sx={{
                minWidth: 110,
                py: 1,
                px: 3,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '0.95rem',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { boxShadow: 2 },
              }}
            >
              Derivar Trámite
            </Button>
          </Box>
        </Box>
      </form>
    </Dialog>
  );
}
