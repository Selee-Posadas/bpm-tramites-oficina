import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ThemeRegistry from '@/shared/theme/ThemeRegistry';
import { TramiteCreateForm } from '@/features/tramites/components/TramiteCreateForm';
import { TipoTramite } from '@/features/tipos-tramite/interfaces/tipo-tramite.interface';

describe('TramiteCreateForm Component (Formik + Yup + a11y)', () => {
  const mockTipos: TipoTramite[] = [
    {
      id: 'tipo-1',
      codigo: 'HAB_COMERCIAL',
      nombre: 'Habilitación Comercial',
      descripcion: 'Trámite de apertura',
      slaHoras: 48,
      areaInicialId: 'area-1',
      requiereExterno: false,
      permiteInicioExterno: true,
      activo: true,
    },
  ];

  it('debe renderizar los campos con atributos accesibles', () => {
    render(
      <ThemeRegistry>
        <TramiteCreateForm
          tiposTramite={mockTipos}
          backHref="/interno/bandeja"
          onSubmit={vi.fn()}
        />
      </ThemeRegistry>,
    );

    expect(screen.getByLabelText(/Título o Asunto Principal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción y Fundamentación Detallada/i)).toBeInTheDocument();
  });

  it('debe validar campos obligatorios al intentar enviar formulario vacío', async () => {
    const handleSubmit = vi.fn();

    render(
      <ThemeRegistry>
        <TramiteCreateForm
          tiposTramite={mockTipos}
          backHref="/interno/bandeja"
          onSubmit={handleSubmit}
        />
      </ThemeRegistry>,
    );

    const submitBtn = screen.getByRole('button', { name: /Crear e Iniciar Trámite/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('El título es obligatorio')).toBeInTheDocument();
      expect(screen.getByText('La descripción es obligatoria')).toBeInTheDocument();
    });

    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
