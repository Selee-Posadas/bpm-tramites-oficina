import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ThemeRegistry from '@/shared/theme/ThemeRegistry';
import { ConfirmDialog } from '@/shared/components/Feedback/ConfirmDialog';

describe('ConfirmDialog Component', () => {
  it('debe disparar onConfirm al hacer clic en el botón de confirmación', () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    render(
      <ThemeRegistry>
        <ConfirmDialog
          open={true}
          title="Aprobar Trámite"
          description="¿Está seguro de aprobar este trámite?"
          confirmText="Aprobar"
          onConfirm={handleConfirm}
          onClose={handleClose}
        />
      </ThemeRegistry>,
    );

    expect(screen.getByText('Aprobar Trámite')).toBeInTheDocument();
    expect(screen.getByText('¿Está seguro de aprobar este trámite?')).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: 'Aprobar' });
    fireEvent.click(confirmButton);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('debe requerir motivo si requireReason es true', () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    render(
      <ThemeRegistry>
        <ConfirmDialog
          open={true}
          title="Rechazar Trámite"
          description="Ingrese el motivo de rechazo"
          requireReason={true}
          confirmText="Rechazar"
          onConfirm={handleConfirm}
          onClose={handleClose}
        />
      </ThemeRegistry>,
    );

    const confirmButton = screen.getByRole('button', { name: 'Rechazar' });
    fireEvent.click(confirmButton);

    expect(handleConfirm).not.toHaveBeenCalled();
    expect(screen.getByText('El motivo es obligatorio para esta operación')).toBeInTheDocument();
  });
});
