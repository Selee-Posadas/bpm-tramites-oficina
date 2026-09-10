import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ThemeRegistry from '@/shared/theme/ThemeRegistry';
import { TramiteFilterBar } from '@/features/tramites/components/TramiteFilterBar';

describe('Filtros de Trámites (TramiteFilterBar)', () => {
  const mockAreas = [
    { id: 'area-1', nombre: 'Compras', codigo: 'COMPRAS', activa: true },
    { id: 'area-2', nombre: 'Legales', codigo: 'LEGALES', activa: true },
  ];

  const mockTipos = [
    {
      id: 'tipo-1',
      codigo: 'HAB',
      nombre: 'Habilitación',
      descripcion: 'Desc',
      slaHoras: 48,
      areaInicialId: 'area-1',
      requiereExterno: false,
      permiteInicioExterno: true,
      activo: true,
    },
  ];

  it('debe renderizar inputs de búsqueda, estado, prioridad y botón limpiar', () => {
    render(
      <ThemeRegistry>
        <TramiteFilterBar
          filtros={{}}
          areas={mockAreas}
          tiposTramite={mockTipos}
          onFiltrosChange={vi.fn()}
          onReset={vi.fn()}
        />
      </ThemeRegistry>,
    );

    expect(screen.getByLabelText(/Buscar por título o número/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Estado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prioridad/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Limpiar/i })).toBeInTheDocument();
  });

  it('debe emitir cambios al escribir en el campo de búsqueda', () => {
    const handleFiltrosChange = vi.fn();

    render(
      <ThemeRegistry>
        <TramiteFilterBar
          filtros={{}}
          areas={mockAreas}
          tiposTramite={mockTipos}
          onFiltrosChange={handleFiltrosChange}
          onReset={vi.fn()}
        />
      </ThemeRegistry>,
    );

    const searchInput = screen.getByLabelText(/Buscar por título o número/i);
    fireEvent.change(searchInput, { target: { value: 'TRM-2026' } });

    expect(handleFiltrosChange).toHaveBeenCalledWith({ busqueda: 'TRM-2026' });
  });

  it('debe invocar onReset al presionar el botón Limpiar', () => {
    const handleReset = vi.fn();

    render(
      <ThemeRegistry>
        <TramiteFilterBar
          filtros={{ busqueda: 'algo' }}
          areas={mockAreas}
          tiposTramite={mockTipos}
          onFiltrosChange={vi.fn()}
          onReset={handleReset}
        />
      </ThemeRegistry>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Limpiar/i }));
    expect(handleReset).toHaveBeenCalled();
  });
});
