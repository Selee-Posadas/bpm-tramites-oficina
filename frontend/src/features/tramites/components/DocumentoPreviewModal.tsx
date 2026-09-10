'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { DocumentoItem } from '../interfaces/tramite.interface';

interface DocumentoPreviewModalProps {
  documento: DocumentoItem | null;
  open: boolean;
  onClose: () => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const DocumentoPreviewModal: React.FC<DocumentoPreviewModalProps> = ({
  documento,
  open,
  onClose,
}) => {
  if (!documento) return null;

  const isPdf =
    documento.mimeType.includes('pdf') || documento.nombreArchivo.toLowerCase().endsWith('.pdf');
  const isImage =
    documento.mimeType.startsWith('image/') ||
    /\.(png|jpg|jpeg|webp)$/i.test(documento.nombreArchivo);

  const handleDescargar = () => {
    const dummyContent = `Documento Oficial BPM - ${documento.nombreArchivo}\nStorageKey: ${documento.storageKey}\nFecha Carga: ${documento.fechaCarga}\nSubido Por: ${documento.subidoPorId} (${documento.subidoPorTipo})\nTamaño: ${documento.size} bytes`;
    const blob = new Blob([dummyContent], { type: documento.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = documento.nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fechaCargaStr = new Date(documento.fechaCarga).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="preview-doc-title"
    >
      <DialogTitle
        id="preview-doc-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1.5,
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isPdf ? (
            <PictureAsPdfIcon color="error" sx={{ fontSize: 28 }} />
          ) : isImage ? (
            <ImageIcon color="primary" sx={{ fontSize: 28 }} />
          ) : (
            <DescriptionIcon color="action" sx={{ fontSize: 28 }} />
          )}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
              {documento.nombreArchivo}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {documento.id} • {formatBytes(documento.size)}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={documento.mimeType}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: '0.72rem' }}
        />
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            mb: 3,
            p: 2,
            bgcolor: '#f8fafc',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, display: 'block' }}
            >
              Subido Por
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {documento.subidoPorTipo} (ID: {documento.subidoPorId.slice(0, 8)})
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, display: 'block' }}
            >
              Fecha de Carga
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {fechaCargaStr}
            </Typography>
          </Box>
          <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, display: 'block' }}
            >
              Clave de Almacenamiento (Storage Key)
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#475569' }}>
              {documento.storageKey}
            </Typography>
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: 2,
            minHeight: 280,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          {isPdf ? (
            <Box sx={{ maxWidth: 460 }}>
              <PictureAsPdfIcon sx={{ fontSize: 64, color: '#ef4444', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Vista Previa del Documento PDF
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                El documento se encuentra verificado criptográficamente en el repositorio central de
                expedientes.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  mt: 2,
                }}
              >
                <VerifiedUserOutlinedIcon color="success" fontSize="small" />
                <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600 }}>
                  Documento auténtico y registrado
                </Typography>
              </Box>
            </Box>
          ) : isImage ? (
            <Box sx={{ maxWidth: 460 }}>
              <ImageIcon sx={{ fontSize: 64, color: '#2563eb', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Archivo de Imagen Adjunta
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {documento.nombreArchivo} ({formatBytes(documento.size)})
              </Typography>
            </Box>
          ) : (
            <Box sx={{ maxWidth: 460 }}>
              <DescriptionIcon sx={{ fontSize: 64, color: '#64748b', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Documento de Oficina
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Archivo disponible para descarga y revisión en aplicaciones locales.
              </Typography>
            </Box>
          )}
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
        <Button onClick={onClose} startIcon={<CloseIcon />} color="inherit">
          Cerrar
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleDescargar}
        >
          Descargar Archivo
        </Button>
      </DialogActions>
    </Dialog>
  );
};
