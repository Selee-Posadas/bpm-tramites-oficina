'use client';

import React, { useRef, useState } from 'react';
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
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { DocumentoUploadModalProps } from '../interfaces/tramite.interface';

export const DocumentoUploadModal: React.FC<DocumentoUploadModalProps> = ({
  open,
  isLoading = false,
  onClose,
  onSubmit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

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
      sizeKB: Yup.number()
        .positive('Debe ser mayor a 0')
        .max(25000, 'Tamaño máximo 25 MB')
        .required(),
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
        setSelectedFileName(null);
        onClose();
      }
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      formik.setFieldValue('nombreArchivo', file.name);
      formik.setFieldValue('mimeType', file.type || 'application/pdf');
      formik.setFieldValue('sizeKB', Math.max(1, Math.round(file.size / 1024)));
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      formik.resetForm();
      setSelectedFileName(null);
      onClose();
    }
  };

  const isPdf =
    formik.values.mimeType.includes('pdf') || formik.values.nombreArchivo.endsWith('.pdf');
  const isImage = formik.values.mimeType.startsWith('image/');

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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
            />

            <Paper
              elevation={0}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                p: 2.5,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: selectedFileName ? '#f0fdf4' : '#f8fafc',
                border: '2px dashed',
                borderColor: selectedFileName ? '#86efac' : '#cbd5e1',
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: '#f1f5f9',
                },
              }}
            >
              {selectedFileName ? (
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}
                >
                  <CheckCircleIcon sx={{ fontSize: 36, color: '#16a34a' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#15803d' }}>
                    Archivo seleccionado: {selectedFileName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Haz clic si deseas seleccionar otro archivo
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}
                >
                  <CloudUploadIcon sx={{ fontSize: 40, color: '#64748b' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Haz clic para elegir un archivo de tu equipo
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PDF, PNG, JPG, Word o Excel (Máximo 25 MB)
                  </Typography>
                </Box>
              )}
            </Paper>

            {formik.values.nombreArchivo && (
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                {isPdf ? (
                  <PictureAsPdfIcon color="error" />
                ) : isImage ? (
                  <ImageIcon color="primary" />
                ) : (
                  <DescriptionIcon color="action" />
                )}
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                    {formik.values.nombreArchivo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formik.values.mimeType} • {formik.values.sizeKB} KB
                  </Typography>
                </Box>
                <Chip
                  label="Listo para adjuntar"
                  size="small"
                  color="success"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>
            )}

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
              label="Tamaño (en KB)"
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
            startIcon={
              isLoading ? <CircularProgress size={18} color="inherit" /> : <AttachFileIcon />
            }
          >
            Adjuntar Documento
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
