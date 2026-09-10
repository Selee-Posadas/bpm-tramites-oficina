import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/shared/theme/theme';
import { ExternalNavbar } from '@/shared/components/Navigation/ExternalNavbar';
import { ExternalSidebar } from '@/shared/components/Navigation/ExternalSidebar';
import { TipoUsuario } from '@/features/auth/interfaces/auth.interface';

vi.mock('next/navigation', () => ({
  usePathname: () => '/externo/mis-tramites',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/shared/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: {
      id: 'ext-1',
      email: 'proveedor1@externo.local',
      nombre: 'Acme Corporation S.A.',
      tipo: TipoUsuario.EXTERNO,
    },
    isAuthenticated: true,
    isLoading: false,
    logoutExternal: vi.fn(),
  }),
}));

describe('External Navigation Components', () => {
  it('ExternalNavbar no debe contener los botones de navegación en el navbar ni texto plano de usuario', () => {
    render(
      <ThemeProvider theme={theme}>
        <ExternalNavbar onMobileToggle={vi.fn()} />
      </ThemeProvider>,
    );

    expect(screen.getByText('Portal Ciudadano y Proveedores')).toBeInTheDocument();

    expect(screen.queryByRole('link', { name: /mis trámites/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /iniciar nuevo trámite/i })).not.toBeInTheDocument();

    expect(screen.getByRole('button', { name: /menú de usuario/i })).toBeInTheDocument();
  });

  it('ExternalSidebar debe contener los enlaces de navegación y la tarjeta de usuario con cerrar sesión', () => {
    render(
      <ThemeProvider theme={theme}>
        <ExternalSidebar mobileOpen={false} onMobileClose={vi.fn()} />
      </ThemeProvider>,
    );

    const misTramitesLinks = screen.getAllByText('Mis Trámites');
    expect(misTramitesLinks.length).toBeGreaterThanOrEqual(1);

    const nuevoTramiteLinks = screen.getAllByText('Iniciar Nuevo Trámite');
    expect(nuevoTramiteLinks.length).toBeGreaterThanOrEqual(1);

    const userNameElements = screen.getAllByText('Acme Corporation S.A.');
    expect(userNameElements.length).toBeGreaterThanOrEqual(1);

    const userEmailElements = screen.getAllByText('proveedor1@externo.local');
    expect(userEmailElements.length).toBeGreaterThanOrEqual(1);

    const logoutButtons = screen.getAllByRole('button', { name: /cerrar sesión/i });
    expect(logoutButtons.length).toBeGreaterThanOrEqual(1);
  });
});
