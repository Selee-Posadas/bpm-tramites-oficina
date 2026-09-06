import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ThemeRegistry from '@/shared/theme/ThemeRegistry';
import { TramiteTimeline, TimelineMovimientoItem } from '@/shared/components/Timeline/TramiteTimeline';

describe('TramiteTimeline Component', () => {
  it('debe mostrar mensaje vacío cuando no hay movimientos', () => {
    render(
      <ThemeRegistry>
        <TramiteTimeline movimientos={[]} />
      </ThemeRegistry>,
    );
    expect(screen.getByText(/Aún no se registran movimientos/i)).toBeInTheDocument();
  });

  it('debe renderizar la lista de movimientos con su acción y estados', () => {
    const movimientos: TimelineMovimientoItem[] = [
      {
        id: 'mov-1',
        accion: 'CREAR_BORRADOR',
        estadoAnterior: null,
        estadoNuevo: 'BORRADOR',
        usuarioTipo: 'EXTERNO',
        usuarioId: 'ext-1',
        comentario: 'Inicio del trámite',
        fecha: new Date('2026-03-01T10:00:00Z'),
      },
      {
        id: 'mov-2',
        accion: 'INGRESAR',
        estadoAnterior: 'BORRADOR',
        estadoNuevo: 'INGRESADO',
        usuarioTipo: 'EXTERNO',
        usuarioId: 'ext-1',
        comentario: 'Presentación formal',
        fecha: new Date('2026-03-01T11:00:00Z'),
      },
    ];

    render(
      <ThemeRegistry>
        <TramiteTimeline movimientos={movimientos} />
      </ThemeRegistry>,
    );

    expect(screen.getByText('CREAR BORRADOR')).toBeInTheDocument();
    expect(screen.getByText('INGRESAR')).toBeInTheDocument();
    expect(screen.getByText('"Inicio del trámite"')).toBeInTheDocument();
    expect(screen.getByText('"Presentación formal"')).toBeInTheDocument();
  });
});
