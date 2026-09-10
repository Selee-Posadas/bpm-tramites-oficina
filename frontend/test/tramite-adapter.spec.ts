import { describe, it, expect } from 'vitest';
import { TramiteAdapter } from '@/features/tramites/adapters/tramite.adapter';
import { TramiteItemResponseDto } from '@/features/tramites/interfaces/tramite.api.interface';

describe('TramiteAdapter', () => {
  it('toResumenList debe mapear listas de DTOs correctamente sin errores de contexto "this"', () => {
    const rawDtos: TramiteItemResponseDto[] = [
      {
        id: 't-1',
        numero: 'TRM-001',
        tipoTramiteId: 'tipo-1',
        tipoTramiteNombre: 'Solicitud Padrón',
        titulo: 'Trámite de prueba 1',
        descripcion: 'Descripción 1',
        origen: 'EXTERNO',
        estado: 'BORRADOR',
        prioridad: 'MEDIA',
        creadoPorTipo: 'EXTERNO',
        creadoPorId: 'user-1',
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        sla: {
          estaVencido: false,
          minutosRestantes: 1440,
          porcentajeConsumido: 20,
        },
      },
    ];

    const result = TramiteAdapter.toResumenList(rawDtos);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('t-1');
    expect(result[0].numero).toBe('TRM-001');
    expect(result[0].sla.horasRestantes).toBe(24);
    expect(result[0].sla.vencido).toBe(false);
  });
});
