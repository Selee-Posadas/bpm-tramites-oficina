import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkflowActionBar } from '../src/features/tramites/components/WorkflowActionBar';
import { TramiteDetalle } from '../src/features/tramites/interfaces/tramite.interface';
import { AuthUser, RolInterno, TipoUsuario } from '../src/features/auth/interfaces/auth.interface';

describe('WorkflowActionBar (Smart Presentational Component)', () => {
  const mockTramite: TramiteDetalle = {
    id: 'tramite-1',
    numero: 'TR-2026-0001',
    tipoTramiteId: 'tipo-1',
    tipoTramiteNombre: 'Licencia Médica',
    titulo: 'Solicitud de Licencia',
    descripcion: 'Reposo por prescripción médica',
    origen: 'EXTERNO',
    estado: 'INGRESADO',
    prioridad: 'ALTA',
    creadoPorTipo: 'EXTERNO',
    creadoPorId: 'ext-user-1',
    fechaCreacion: new Date('2026-03-01T08:00:00Z'),
    fechaActualizacion: new Date('2026-03-01T08:00:00Z'),
    sla: {
      vencido: false,
      horasRestantes: 48,
      porcentajeConsumido: 20,
    },
    movimientos: [],
    documentos: [],
    comentarios: [],
  };

  const operadorUser: AuthUser = {
    id: 'op-1',
    email: 'op@sistema.local',
    nombre: 'Operador Legales',
    tipo: TipoUsuario.INTERNO,
    rolInterno: RolInterno.OPERADOR,
    areaId: 'area-legales',
  };

  const auditorUser: AuthUser = {
    id: 'audit-1',
    email: 'auditor@sistema.local',
    nombre: 'Auditor General',
    tipo: TipoUsuario.INTERNO,
    rolInterno: RolInterno.AUDITOR,
  };

  const noop = vi.fn().mockResolvedValue(true);

  it('debe mostrar mensaje de solo lectura cuando el usuario es Auditor', () => {
    render(
      <WorkflowActionBar
        tramite={mockTramite}
        user={auditorUser}
        onIngresar={noop}
        onTomar={noop}
        onAsignar={noop}
        onDerivar={noop}
        onObservar={noop}
        onResponderObservacion={noop}
        onSolicitarIntervencionExterna={noop}
        onResponderIntervencionExterna={noop}
        onAprobar={noop}
        onRechazar={noop}
        onCerrar={noop}
        onCancelar={noop}
      />,
    );

    expect(screen.getByText(/Vista de solo lectura \(Rol Auditor\)/i)).toBeDefined();
    expect(screen.queryByText('Tomar Trámite')).toBeNull();
  });

  it('debe mostrar el botón de Tomar Trámite para el Operador en estado INGRESADO', () => {
    render(
      <WorkflowActionBar
        tramite={mockTramite}
        user={operadorUser}
        onIngresar={noop}
        onTomar={noop}
        onAsignar={noop}
        onDerivar={noop}
        onObservar={noop}
        onResponderObservacion={noop}
        onSolicitarIntervencionExterna={noop}
        onResponderIntervencionExterna={noop}
        onAprobar={noop}
        onRechazar={noop}
        onCerrar={noop}
        onCancelar={noop}
      />,
    );

    expect(screen.getByText('Tomar Trámite')).toBeDefined();
  });

  it('no debe mostrar botón de Ingresar a un Operador si el trámite es borrador del circuito EXTERNO_INTERNO', () => {
    const tramiteBorradorExterno: TramiteDetalle = {
      ...mockTramite,
      estado: 'BORRADOR',
      origen: 'EXTERNO_INTERNO',
      creadoPorTipo: 'EXTERNO',
    };

    render(
      <WorkflowActionBar
        tramite={tramiteBorradorExterno}
        user={operadorUser}
        onIngresar={noop}
        onTomar={noop}
        onAsignar={noop}
        onDerivar={noop}
        onObservar={noop}
        onResponderObservacion={noop}
        onSolicitarIntervencionExterna={noop}
        onResponderIntervencionExterna={noop}
        onAprobar={noop}
        onRechazar={noop}
        onCerrar={noop}
        onCancelar={noop}
      />,
    );

    expect(screen.queryByText('Ingresar a Revisión')).toBeNull();
    expect(screen.getByText(/Trámite en preparación por el solicitante externo/i)).toBeDefined();
  });

  it('debe mostrar botón de Ingresar Trámite a un usuario Externo si su trámite está en BORRADOR', () => {
    const tramiteBorradorExterno: TramiteDetalle = {
      ...mockTramite,
      estado: 'BORRADOR',
      origen: 'EXTERNO_INTERNO',
      creadoPorTipo: 'EXTERNO',
    };

    const externoUser: AuthUser = {
      id: 'ext-user-1',
      email: 'proveedor@externo.local',
      nombre: 'Proveedor Local',
      tipo: TipoUsuario.EXTERNO,
    };

    render(
      <WorkflowActionBar
        tramite={tramiteBorradorExterno}
        user={externoUser}
        onIngresar={noop}
        onTomar={noop}
        onAsignar={noop}
        onDerivar={noop}
        onObservar={noop}
        onResponderObservacion={noop}
        onSolicitarIntervencionExterna={noop}
        onResponderIntervencionExterna={noop}
        onAprobar={noop}
        onRechazar={noop}
        onCerrar={noop}
        onCancelar={noop}
      />,
    );

    expect(screen.getByText('Ingresar Trámite')).toBeDefined();
  });

  it('en EN_REVISION para EXTERNO_INTERNO debe mostrar Observar y no Solicitar Intervención Externa ni Derivar', () => {
    const tramiteEnRevisionExterno: TramiteDetalle = {
      ...mockTramite,
      estado: 'EN_REVISION',
      origen: 'EXTERNO_INTERNO',
    };

    render(
      <WorkflowActionBar
        tramite={tramiteEnRevisionExterno}
        user={operadorUser}
        onIngresar={noop}
        onTomar={noop}
        onAsignar={noop}
        onDerivar={noop}
        onObservar={noop}
        onResponderObservacion={noop}
        onSolicitarIntervencionExterna={noop}
        onResponderIntervencionExterna={noop}
        onAprobar={noop}
        onRechazar={noop}
        onCerrar={noop}
        onCancelar={noop}
      />,
    );

    expect(screen.getByText('Aprobar')).toBeDefined();
    expect(screen.getByText('Rechazar')).toBeDefined();
    expect(screen.getByText('Observar')).toBeDefined();
    expect(screen.queryByText('Solicitar Intervención Externa')).toBeNull();
    expect(screen.queryByText('Derivar a Otra Área')).toBeNull();
  });
});
