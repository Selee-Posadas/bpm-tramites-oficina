'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Box,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { DocumentoUploadModalProps } from '../interfaces/tramite.interface';

export const DocumentoUploadModal: React.FC<DocumentoUploadModalProps> = ({
  open,
  isLoading = false,
  onClose,
  onSubmit,
}) => {
  const formik = useFormik({
    initialValues: {
      nombreArchivo: '',
      mimeType: 'application/pdf',
      sizeKB: 250,
    },
    validationSchema: Yup.object({
      nombreArchivo: Yup.string()
        .trim()
        .required('El nombre del archivo es obligatorio')
        .matches(/\.[0-9a-z]+$/i, 'Debe incluir una extensión válida (ej: .pdf, .docx, .png)'),
      mimeType: Yup.string().required('El tipo de archivo es obligatorio'),
      sizeKB: Yup.number().positive('Debe ser mayor a 0').max(25000, 'Tamaño máximo 25 MB').required(),
    }),
    onSubmit: async (values, { resetForm }) => {
      const storageKey = `docs/${Date.now()}-${values.nombreArchivo.replace(/\s+/g, '_')}`;
      const ok = await onSubmit({
        nombreArchivo: values.nombreArchivo.trim(),
        mimeType: values.mimeType,
        size: Math.round(values.sizeKB * 1024),
        storageKey,
      });

      if (ok) {
        resetForm();
        onClose();
      }
    },
  });

  const handleClose = () => {
    if (!isLoading) {
      formik.resetForm();
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="adjuntar-doc-dialog-title"
    >
      <DialogTitle id="adjuntar-doc-dialog-title" sx={{ fontWeight: 700 }}>
        Adjuntar Documentación al Trámite
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              id="doc-nombre-archivo-input"
              name="nombreArchivo"
              label="Nombre del archivo (con extensión)"
              placeholder="ej: Formulario_01_Firmado.pdf"
              fullWidth
              value={formik.values.nombreArchivo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.nombreArchivo && Boolean(formik.errors.nombreArchivo)}
              helperText={formik.touched.nombreArchivo && formik.errors.nombreArchivo}
              autoFocus
            />

            <TextField
              id="doc-mimetype-select"
              name="mimeType"
              select
              label="Tipo MIME / Formato"
              fullWidth
              value={formik.values.mimeType}
              onChange={formik.handleChange}
            >
              <MenuItem value="application/pdf">PDF (Documento Portable)</MenuItem>
              <MenuItem value="image/png">Imagen PNG</MenuItem>
              <MenuItem value="image/jpeg">Imagen JPEG</MenuItem>
              <MenuItem value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">
                Word (.docx)
              </MenuItem>
              <MenuItem value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
                Excel (.xlsx)
              </MenuItem>
            </TextField>

            <TextField
              id="doc-size-input"
              name="sizeKB"
              type="number"
              label="Tamaño simulado (en KB)"
              fullWidth
              value={formik.values.sizeKB}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.sizeKB && Boolean(formik.errors.sizeKB)}
              helperText={formik.touched.sizeKB && formik.errors.sizeKB}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleClose} disabled={isLoading} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading || !formik.isValid}
            startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />}
          >
            Cargar y Adjuntar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
