'use client';

import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { NotificationProvider } from '../context/NotificationContext';
import { AuthProvider } from '../context/AuthContext';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <AuthProvider>{children}</AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
