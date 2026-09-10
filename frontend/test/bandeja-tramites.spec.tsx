import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ThemeRegistry from '@/shared/theme/ThemeRegistry';
import { TramiteTable } from '@/features/tramites/components/TramiteTable';
import { TramiteResumen } from '@/features/tramites/interfaces/tramite.interface';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/interno/bandeja',
  useSearchParams: () => new URLSearchParams(),
}));

describe('Bandeja de Trámites (TramiteTable)', () => {
  const mockTramites: TramiteResumen[] = [
    {
      id: 't-1',
      numero: 'TRM-2026-0001',
      tipoTramiteId: 'tipo-1',
      tipoTramiteNombre: 'Solicitud de Compra',
      titulo: 'Compra de Monitores 4K',
      descripcion: 'Equipamiento informático',
      origen: 'INTERNO_INTERNO',
      estado: 'EN_REVISION',
      prioridad: 'ALTA',
      areaActualId: 'area-1',
      areaActualNombre: 'Compras',
      usuarioAsignadoId: 'u-1',
      usuarioAsignadoNombre: 'Juan Operador',
      fechaCreacion: new Date('2026-01-10T10:00:00Z'),
      fechaActualizacion: new Date('2026-01-10T10:00:00Z'),
      sla: {
        slaHoras: 48,
        horasTranscurridas: 12,
        horasRestantes: 36,
        porcentajeConsumido: 25,
        estaVencido: false,
        proximoAVencer: false,
      },
    },
  ];

  it('debe renderizar las columnas principales y los datos del trámite', () => {
    render(
      <ThemeRegistry>
        <TramiteTable
          tramites={mockTramites}
          total={1}
          skip={0}
          take={10}
          onPageChange={vi.fn()}
        />
      </ThemeRegistry>,
    );

    expect(screen.getByText('TRM-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('Compra de Monitores 4K')).toBeInTheDocument();
    expect(screen.getByText('Solicitud de Compra')).toBeInTheDocument();
    expect(screen.getByText(/En Revisión/i)).toBeInTheDocument();
  });

  it('debe mostrar estado vacío (EmptyState) si la lista de trámites está vacía', () => {
    render(
      <ThemeRegistry>
        <TramiteTable
          tramites={[]}
          total={0}
          skip={0}
          take={10}
          onPageChange={vi.fn()}
        />
      </ThemeRegistry>,
    );

    expect(screen.getByText(/No hay trámites para mostrar/i)).toBeInTheDocument();
  });
});
