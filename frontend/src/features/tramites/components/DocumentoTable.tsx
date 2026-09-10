'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  Box,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { DocumentoTableProps, DocumentoItem } from '../interfaces/tramite.interface';
import { RolInterno } from '../../auth/interfaces/auth.interface';
import { DocumentoPreviewModal } from './DocumentoPreviewModal';

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const DocumentoTable: React.FC<DocumentoTableProps> = ({
  documentos,
  user,
  isLoading = false,
  onEliminar,
}) => {
  const [previewDoc, setPreviewDoc] = useState<DocumentoItem | null>(null);

  if (documentos.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: '#f8fafc',
          border: '1px dashed #cbd5e1',
          borderRadius: 2,
        }}
      >
        <InsertDriveFileOutlinedIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          No se han adjuntado documentos a este trámite todavía.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}
    >
      <Table size="small" aria-label="tabla de documentos">
        <TableHead sx={{ bgcolor: '#f8fafc' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Archivo</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Tamaño</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Subido por</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>
              Acciones
            </TableCell>
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
                <TableCell sx={{ fontWeight: 600 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InsertDriveFileOutlinedIcon fontSize="small" color="primary" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {doc.nombreArchivo}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{doc.mimeType}</TableCell>
                <TableCell>{formatBytes(doc.size)}</TableCell>
                <TableCell>
                  {doc.subidoPorTipo} ({doc.subidoPorId})
                </TableCell>
                <TableCell>{fecha}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    <Tooltip title="Visualizar documento">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => setPreviewDoc(doc)}
                        aria-label={`Visualizar ${doc.nombreArchivo}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <DocumentoPreviewModal
        documento={previewDoc}
        open={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
      />
    </TableContainer>
  );
};
