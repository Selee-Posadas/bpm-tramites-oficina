import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ThemeRegistry from '@/shared/theme/ThemeRegistry';
import InternoErrorBoundary from '@/app/(interno)/interno/error';
import * as AuthContextModule from '@/shared/context/AuthContext';

describe('Render de Errores (InternoErrorBoundary)', () => {
  it('debe renderizar el mensaje de error y botón de reintento de forma accesible', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      logoutInternal: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
      user: null,
      error: null,
    } as any);

    const mockReset = vi.fn();
    const testError = new Error('Error de conexión con la API de Trámites');

    render(
      <ThemeRegistry>
        <InternoErrorBoundary error={testError} reset={mockReset} />
      </ThemeRegistry>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Ocurrió un error en el Portal Interno/i);
    expect(screen.getByText('Error de conexión con la API de Trámites')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Reintentar/i });
    expect(retryBtn).toBeInTheDocument();

    fireEvent.click(retryBtn);
    expect(mockReset).toHaveBeenCalled();
  });
});
