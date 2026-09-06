import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ThemeRegistry from '@/shared/theme/ThemeRegistry';
import { EstadoBadge } from '@/shared/components/Badges/EstadoBadge';
import { PrioridadBadge } from '@/shared/components/Badges/PrioridadBadge';
import { SlaBadge } from '@/shared/components/Badges/SlaBadge';

describe('Badges Operativos (Estado, Prioridad, SLA)', () => {
  it('debe renderizar el EstadoBadge con el texto correspondiente', () => {
    render(
      <ThemeRegistry>
        <EstadoBadge estado="EN_REVISION" />
      </ThemeRegistry>,
    );
    expect(screen.getByText('En Revisión')).toBeInTheDocument();
  });

  it('debe renderizar todos los estados canónicos del workflow', () => {
    const estados = ['BORRADOR', 'INGRESADO', 'OBSERVADO', 'DERIVADO', 'APROBADO', 'RECHAZADO', 'CERRADO'];
    const { unmount } = render(
      <ThemeRegistry>
        {estados.map((est) => (
          <EstadoBadge key={est} estado={est} />
        ))}
      </ThemeRegistry>,
    );

    expect(screen.getByText('Borrador')).toBeInTheDocument();
    expect(screen.getByText('Ingresado')).toBeInTheDocument();
    expect(screen.getByText('Observado')).toBeInTheDocument();
    expect(screen.getByText('Derivado')).toBeInTheDocument();
    expect(screen.getByText('Aprobado')).toBeInTheDocument();
    expect(screen.getByText('Rechazado')).toBeInTheDocument();
    expect(screen.getByText('Cerrado')).toBeInTheDocument();
    unmount();
  });

  it('debe renderizar PrioridadBadge correctamente', () => {
    render(
      <ThemeRegistry>
        <PrioridadBadge prioridad="URGENTE" />
      </ThemeRegistry>,
    );
    expect(screen.getByText('Urgente')).toBeInTheDocument();
  });

  it('debe alertar cuando el SLA se encuentra vencido', () => {
    render(
      <ThemeRegistry>
        <SlaBadge
          sla={{
            vencido: true,
            horasRestantes: -5,
            porcentajeConsumido: 120,
          }}
        />
      </ThemeRegistry>,
    );
    expect(screen.getByText('Vencido (5h)')).toBeInTheDocument();
  });

  it('debe mostrar horas restantes cuando está en término', () => {
    render(
      <ThemeRegistry>
        <SlaBadge
          sla={{
            vencido: false,
            horasRestantes: 18,
            porcentajeConsumido: 25,
          }}
        />
      </ThemeRegistry>,
    );
    expect(screen.getByText('18h')).toBeInTheDocument();
  });
});
