import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ThemeRegistry from '@/shared/theme/ThemeRegistry';
import ExternoLoginPage from '@/app/(externo)/externo/login/page';
import * as AuthContextModule from '@/shared/context/AuthContext';

describe('Formulario de Login Externo (Formik + Yup + a11y)', () => {
  const mockLoginExternal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      loginExternal: mockLoginExternal,
      loginInternalMock: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
    } as any);
  });

  it('debe renderizar los campos con atributos accesibles e inputs requeridos', () => {
    render(
      <ThemeRegistry>
        <ExternoLoginPage />
      </ThemeRegistry>,
    );

    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
  });

  it('debe mostrar errores de validación Yup si los campos son inválidos o se tocan vacíos', async () => {
    render(
      <ThemeRegistry>
        <ExternoLoginPage />
      </ThemeRegistry>,
    );

    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/Ingrese un email válido/i)).toBeInTheDocument();
    });
  });

  it('debe llamar a loginExternal al enviar credenciales válidas', async () => {
    mockLoginExternal.mockResolvedValueOnce(undefined);

    render(
      <ThemeRegistry>
        <ExternoLoginPage />
      </ThemeRegistry>,
    );

    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const submitBtn = screen.getByRole('button', { name: /Iniciar Sesión/i });

    fireEvent.change(emailInput, { target: { value: 'usuario@empresa.com' } });
    fireEvent.blur(emailInput);

    fireEvent.change(passwordInput, { target: { value: 'Secret123!' } });
    fireEvent.blur(passwordInput);

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLoginExternal).toHaveBeenCalledWith('usuario@empresa.com', 'Secret123!');
    });
  });
});
