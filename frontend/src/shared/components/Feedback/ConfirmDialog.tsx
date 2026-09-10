'use client';

import React, { useState } from 'react';
import {
  Dialog,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { ConfirmDialogProps } from '../../interfaces/feedback.interface';

export type { ConfirmDialogProps };

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

  const renderIcon = () => {
    const iconSx = { fontSize: 62, mb: 1.5 };
    if (confirmColor === 'error') {
      return <ErrorOutlineIcon color="error" sx={iconSx} />;
    }
    if (confirmColor === 'warning') {
      return <WarningAmberIcon color="warning" sx={iconSx} />;
    }
    if (confirmColor === 'success') {
      return <CheckCircleOutlineIcon color="success" sx={iconSx} />;
    }
    if (confirmColor === 'secondary') {
      return <AltRouteIcon color="secondary" sx={iconSx} />;
    }
    if (title.toLowerCase().includes('cerrar')) {
      return <LockOutlinedIcon color="action" sx={iconSx} />;
    }
    return <InfoOutlinedIcon color="primary" sx={iconSx} />;
  };

  const getTitleColor = () => {
    if (confirmColor === 'error') return 'error.main';
    if (confirmColor === 'warning') return 'warning.dark';
    if (confirmColor === 'success') return 'success.main';
    if (confirmColor === 'secondary') return 'secondary.main';
    return 'primary.main';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={requireReason ? 'sm' : 'xs'}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          px: { xs: 2.5, sm: 3.5 },
          py: { xs: 3, sm: 3.5 },
          width: '100%',
          maxWidth: requireReason ? 460 : 380,
          mx: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          textAlign: 'center',
        },
      }}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {renderIcon()}

        <Typography
          id="confirm-dialog-title"
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 700,
            fontSize: '1.25rem',
            color: getTitleColor(),
            textAlign: 'center',
            lineHeight: 1.3,
            mb: 1.5,
          }}
        >
          {title}
        </Typography>

        <Typography
          id="confirm-dialog-description"
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontSize: '0.95rem',
            textAlign: 'center',
            lineHeight: 1.5,
            mb: requireReason ? 2.5 : 3,
            px: 0.5,
          }}
        >
          {description}
        </Typography>

        {requireReason && (
          <Box sx={{ width: '100%', mb: 3, textAlign: 'left' }}>
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
            {cancelText}
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            variant="contained"
            color={confirmColor}
            startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{
              minWidth: 110,
              py: 1,
              px: 3,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.95rem',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 2,
              },
            }}
          >
            {confirmText}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
