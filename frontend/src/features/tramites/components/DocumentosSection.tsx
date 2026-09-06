'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { DocumentoItem } from '../interfaces/tramite.interface';
import { AuthUser, RolInterno } from '../../auth/interfaces/auth.interface';

interface DocumentosSectionProps {
  documentos: DocumentoItem[];
  user: AuthUser | null;
  isLoading?: boolean;
  onAdjuntar: (doc: { nombreArchivo: string; mimeType: string; size: number; storageKey: string }) => Promise<boolean>;
  onEliminar: (docId: string) => Promise<boolean>;
}

export const DocumentosSection: React.FC<DocumentosSectionProps> = ({
  documentos,
  user,
  isLoading = false,
  onAdjuntar,
  onEliminar,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

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
      const ok = await onAdjuntar({
        nombreArchivo: values.nombreArchivo.trim(),
        mimeType: values.mimeType,
        size: Math.round(values.sizeKB * 1024),
        storageKey,
      });

      if (ok) {
        resetForm();
        setModalOpen(false);
      }
    },
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachFileIcon />
          Documentación Adjunta ({documentos.length})
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<CloudUploadIcon />}
          onClick={() => setModalOpen(true)}
          disabled={isLoading}
          size="small"
        >
          Adjuntar Documento
        </Button>
      </Box>

      {documentos.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 2 }}>
          <InsertDriveFileOutlinedIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No se han adjuntado documentos a este trámite todavía.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <Table size="small" aria-label="tabla de documentos">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Archivo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tamaño</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Subido por</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documentos.map((doc) => {
                const fecha = new Date(doc.fechaCarga).toLocaleString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const canDelete =
                  user &&
                  (doc.subidoPorId === user.id ||
                    user.rolInterno === RolInterno.ADMIN ||
                    user.rolInterno === RolInterno.SUPERVISOR);

                return (
                  <TableRow key={doc.id} hover>
                    <TableCell sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InsertDriveFileOutlinedIcon fontSize="small" color="primary" />
                      {doc.nombreArchivo}
                    </TableCell>
                    <TableCell>{doc.mimeType}</TableCell>
                    <TableCell>{formatBytes(doc.size)}</TableCell>
                    <TableCell>{doc.subidoPorTipo} ({doc.subidoPorId})</TableCell>
                    <TableCell>{fecha}</TableCell>
                    <TableCell align="center">
                      {canDelete && (
                        <Tooltip title="Eliminar documento">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onEliminar(doc.id)}
                            disabled={isLoading}
                            aria-label={`Eliminar ${doc.nombreArchivo}`}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={modalOpen}
        onClose={() => !isLoading && setModalOpen(false)}
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
            <Button onClick={() => setModalOpen(false)} disabled={isLoading} color="inherit">
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
    </Box>
  );
};
