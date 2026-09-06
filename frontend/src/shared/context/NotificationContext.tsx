'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

export interface NotificationContextType {
  notify: (message: string, severity?: AlertColor) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

type NotificationListener = (message: string, severity: AlertColor) => void;
const listeners: Set<NotificationListener> = new Set();

export function emitGlobalNotification(message: string, severity: AlertColor = 'error'): void {
  listeners.forEach((listener) => listener(message, severity));
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  const notify = useCallback((msg: string, sev: AlertColor = 'info') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  const showSuccess = useCallback((msg: string) => notify(msg, 'success'), [notify]);
  const showError = useCallback((msg: string) => notify(msg, 'error'), [notify]);
  const showWarning = useCallback((msg: string) => notify(msg, 'warning'), [notify]);
  const showInfo = useCallback((msg: string) => notify(msg, 'info'), [notify]);

  React.useEffect(() => {
    const handler: NotificationListener = (msg, sev) => {
      notify(msg, sev);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, [notify]);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <NotificationContext.Provider
      value={{
        notify,
        showSuccess,
        showError,
        showWarning,
        showInfo,
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
