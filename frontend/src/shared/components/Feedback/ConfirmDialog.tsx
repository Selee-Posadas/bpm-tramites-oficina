'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
} from '@mui/material';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  isLoading?: boolean;
  onConfirm: (reason?: string) => Promise<void> | void;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColor = 'primary',
  requireReason = false,
  reasonLabel = 'Motivo / Observación',
  reasonPlaceholder = 'Ingrese el motivo detallado...',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError('El motivo es obligatorio para esta operación');
      return;
    }
    setError('');
    await onConfirm(reason.trim());
    setReason('');
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 700 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description" sx={{ mb: requireReason ? 2 : 0 }}>
          {description}
        </DialogContentText>

        {requireReason && (
          <Box sx={{ mt: 2 }}>
            <TextField
              id="confirm-dialog-reason-input"
              name="reason"
              label={reasonLabel}
              placeholder={reasonPlaceholder}
              multiline
              rows={3}
              fullWidth
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              error={!!error}
              helperText={error}
              disabled={isLoading}
              autoFocus
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} disabled={isLoading} color="inherit">
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isLoading}
          variant="contained"
          color={confirmColor}
          startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
