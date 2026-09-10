import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AreaTable } from '../src/features/areas/components/AreaTable';
import { Area } from '../src/features/areas/interfaces/area.interface';

describe('AreaTable (Dumb Component)', () => {
  const mockAreas: Area[] = [
    {
      id: 'area-1',
      codigo: 'LEGALES',
      nombre: 'Gerencia de Legales',
      activa: true,
    },
  ];

  it('debe renderizar la lista de áreas correctamente', () => {
    const onEdit = vi.fn();
    render(<AreaTable areas={mockAreas} onEdit={onEdit} />);

    expect(screen.getByText('LEGALES')).toBeDefined();
    expect(screen.getByText('Gerencia de Legales')).toBeDefined();
    expect(screen.getByText('Activa')).toBeDefined();
  });

  it('debe invocar onEdit al hacer clic en el botón de edición', () => {
    const onEdit = vi.fn();
    render(<AreaTable areas={mockAreas} onEdit={onEdit} />);

    const editBtn = screen.getByLabelText('Editar área Gerencia de Legales');
    fireEvent.click(editBtn);

    expect(onEdit).toHaveBeenCalledWith(mockAreas[0]);
  });
});
