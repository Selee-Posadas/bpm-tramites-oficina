'use client';

import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { DocumentosSectionProps } from '../interfaces/tramite.interface';
import { DocumentoTable } from './DocumentoTable';
import { DocumentoUploadModal } from './DocumentoUploadModal';

export const DocumentosSection: React.FC<DocumentosSectionProps> = ({
  documentos,
  user,
  isLoading = false,
  onAdjuntar,
  onEliminar,
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

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

      <DocumentoTable
        documentos={documentos}
        user={user}
        isLoading={isLoading}
        onEliminar={onEliminar}
      />

      <DocumentoUploadModal
        open={modalOpen}
        isLoading={isLoading}
        onClose={() => setModalOpen(false)}
        onSubmit={onAdjuntar}
      />
    </Box>
  );
};
