import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TipoTramiteTable } from '../src/features/tipos-tramite/components/TipoTramiteTable';
import { TipoTramite } from '../src/features/tipos-tramite/interfaces/tipo-tramite.interface';

describe('TipoTramiteTable (Dumb Component)', () => {
  const mockTipos: TipoTramite[] = [
    {
      id: 'tipo-1',
      codigo: 'HAB_COMERCIAL',
      nombre: 'Habilitación Comercial',
      descripcion: 'Trámite de apertura de local',
      slaHoras: 48,
      areaInicialId: 'area-1',
      requiereExterno: true,
      permiteInicioExterno: true,
      activo: true,
    },
  ];

  it('debe renderizar la lista de tipos de trámite correctamente', () => {
    const onEdit = vi.fn();
    render(<TipoTramiteTable tiposTramite={mockTipos} onEdit={onEdit} />);

    expect(screen.getByText('HAB_COMERCIAL')).toBeDefined();
    expect(screen.getByText('Habilitación Comercial')).toBeDefined();
    expect(screen.getByText('48 horas')).toBeDefined();
    expect(screen.getByText('Activo')).toBeDefined();
  });

  it('debe invocar onEdit al hacer clic en el botón de edición', () => {
    const onEdit = vi.fn();
    render(<TipoTramiteTable tiposTramite={mockTipos} onEdit={onEdit} />);

    const editBtn = screen.getByLabelText('Editar tipo de trámite Habilitación Comercial');
    fireEvent.click(editBtn);

    expect(onEdit).toHaveBeenCalledWith(mockTipos[0]);
  });
});
