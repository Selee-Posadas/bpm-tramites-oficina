'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Snackbar,
  Alert,
  AlertColor,
  Dialog,
  Button,
  Box,
  Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export interface NotificationDialogOptions {
  title: string;
  message: string;
  severity?: AlertColor;
}

export interface NotificationContextType {
  notify: (message: string, severity?: AlertColor) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  showDialog: (options: NotificationDialogOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

type NotificationListener = (message: string, severity: AlertColor) => void;
const listeners: Set<NotificationListener> = new Set();

type DialogListener = (options: NotificationDialogOptions) => void;
const dialogListeners: Set<DialogListener> = new Set();

export function emitGlobalNotification(message: string, severity: AlertColor = 'error'): void {
  listeners.forEach((listener) => listener(message, severity));
}

export function emitGlobalDialog(title: string, message: string, severity: AlertColor = 'warning'): void {
  dialogListeners.forEach((listener) => listener({ title, message, severity }));
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');
  const [dialogState, setDialogState] = useState<NotificationDialogOptions | null>(null);

  const notify = useCallback((msg: string, sev: AlertColor = 'info') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  const showSuccess = useCallback((msg: string) => notify(msg, 'success'), [notify]);
  const showError = useCallback((msg: string) => notify(msg, 'error'), [notify]);
  const showWarning = useCallback((msg: string) => notify(msg, 'warning'), [notify]);
  const showInfo = useCallback((msg: string) => notify(msg, 'info'), [notify]);
  const showDialog = useCallback((options: NotificationDialogOptions) => {
    setDialogState(options);
  }, []);

  React.useEffect(() => {
    const handler: NotificationListener = (msg, sev) => {
      notify(msg, sev);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, [notify]);

  React.useEffect(() => {
    const dialogHandler: DialogListener = (options) => {
      setDialogState(options);
    };
    dialogListeners.add(dialogHandler);
    return () => {
      dialogListeners.delete(dialogHandler);
    };
  }, []);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleCloseDialog = () => {
    setDialogState(null);
  };

  return (
    <NotificationContext.Provider
      value={{
        notify,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showDialog,
      }}
    >
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%', boxShadow: 3 }}>
          {message}
        </Alert>
      </Snackbar>

      {dialogState && (
        <Dialog
          open={Boolean(dialogState)}
          onClose={handleCloseDialog}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              px: { xs: 2.5, sm: 3.5 },
              py: { xs: 3, sm: 3.5 },
              width: '100%',
              maxWidth: 360,
              mx: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              textAlign: 'center',
            },
          }}
          aria-labelledby="notification-dialog-title"
          aria-describedby="notification-dialog-description"
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {dialogState.severity === 'error' && (
              <ErrorOutlineIcon color="error" sx={{ fontSize: 62, mb: 1.5 }} />
            )}
            {dialogState.severity === 'warning' && (
              <WarningAmberIcon color="warning" sx={{ fontSize: 62, mb: 1.5 }} />
            )}
            {dialogState.severity === 'info' && (
              <InfoOutlinedIcon color="info" sx={{ fontSize: 62, mb: 1.5 }} />
            )}
            {dialogState.severity === 'success' && (
              <CheckCircleOutlineIcon color="success" sx={{ fontSize: 62, mb: 1.5 }} />
            )}

            <Typography
              id="notification-dialog-title"
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 700,
                fontSize: '1.25rem',
                color:
                  dialogState.severity === 'error'
                    ? 'error.main'
                    : dialogState.severity === 'warning'
                      ? 'warning.dark'
                      : 'primary.main',
                textAlign: 'center',
                lineHeight: 1.3,
                mb: 1.5,
              }}
            >
              {dialogState.title}
            </Typography>

            <Typography
              id="notification-dialog-description"
              variant="body1"
              sx={{
                color: 'text.secondary',
                fontSize: '0.95rem',
                textAlign: 'center',
                lineHeight: 1.5,
                mb: 3,
                px: 0.5,
              }}
            >
              {dialogState.message}
            </Typography>

            <Button
              onClick={handleCloseDialog}
              variant="contained"
              color={
                dialogState.severity === 'error'
                  ? 'error'
                  : dialogState.severity === 'warning'
                    ? 'warning'
                    : 'primary'
              }
              autoFocus
              sx={{
                minWidth: 120,
                py: 1,
                px: 3.5,
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
              Entendido
            </Button>
          </Box>
        </Dialog>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser utilizado dentro de un NotificationProvider');
  }
  return context;
}
