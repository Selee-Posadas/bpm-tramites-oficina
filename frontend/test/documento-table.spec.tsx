import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentoTable } from '../src/features/tramites/components/DocumentoTable';
import { DocumentoItem } from '../src/features/tramites/interfaces/tramite.interface';
import { AuthUser, RolInterno, TipoUsuario } from '../src/features/auth/interfaces/auth.interface';

describe('DocumentoTable (Dumb Component)', () => {
  const mockDocs: DocumentoItem[] = [
    {
      id: 'doc-1',
      nombreArchivo: 'expediente_firmado.pdf',
      mimeType: 'application/pdf',
      size: 1024 * 500,
      storageKey: 'docs/test-expediente.pdf',
      subidoPorTipo: 'INTERNO',
      subidoPorId: 'user-op-1',
      fechaCarga: new Date('2026-03-01T10:00:00Z'),
    },
  ];

  const adminUser: AuthUser = {
    id: 'admin-1',
    email: 'admin@sistema.local',
    nombre: 'Administrador',
    tipo: TipoUsuario.INTERNO,
    rolInterno: RolInterno.ADMIN,
  };

  const otherUser: AuthUser = {
    id: 'user-op-2',
    email: 'op2@sistema.local',
    nombre: 'Operador 2',
    tipo: TipoUsuario.INTERNO,
    rolInterno: RolInterno.OPERADOR,
  };

  it('debe renderizar el mensaje vacío cuando no hay documentos', () => {
    const onEliminar = vi.fn();
    render(<DocumentoTable documentos={[]} user={adminUser} onEliminar={onEliminar} />);

    expect(screen.getByText(/No se han adjuntado documentos/i)).toBeDefined();
  });

  it('debe renderizar la lista de documentos y formatear tamaño correctamente', () => {
    const onEliminar = vi.fn();
    render(<DocumentoTable documentos={mockDocs} user={adminUser} onEliminar={onEliminar} />);

    expect(screen.getByText('expediente_firmado.pdf')).toBeDefined();
    expect(screen.getByText('application/pdf')).toBeDefined();
    expect(screen.getByText('500 KB')).toBeDefined();
  });

  it('debe permitir eliminar al admin e invocar onEliminar', () => {
    const onEliminar = vi.fn();
    render(<DocumentoTable documentos={mockDocs} user={adminUser} onEliminar={onEliminar} />);

    const deleteBtn = screen.getByLabelText('Eliminar expediente_firmado.pdf');
    expect(deleteBtn).toBeDefined();

    fireEvent.click(deleteBtn);
    expect(onEliminar).toHaveBeenCalledWith('doc-1');
  });

  it('no debe mostrar botón de eliminar a un operador que no es el autor', () => {
    const onEliminar = vi.fn();
    render(<DocumentoTable documentos={mockDocs} user={otherUser} onEliminar={onEliminar} />);

    expect(screen.queryByLabelText('Eliminar expediente_firmado.pdf')).toBeNull();
  });
});
