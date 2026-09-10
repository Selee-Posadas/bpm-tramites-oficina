'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';
import { MovimientoStatItem } from '../interfaces/dashboard.interface';
import { EstadoBadge, EstadoTramite } from '@/shared/components/Badges/EstadoBadge';

interface UltimosMovimientosTableProps {
  movimientos: MovimientoStatItem[];
}

const ACCION_COLORS: Record<
  string,
  { label: string; color: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'default' }
> = {
  INGRESAR: { label: 'Ingresado', color: 'info' },
  TOMAR: { label: 'Tomado', color: 'primary' },
  ASIGNAR: { label: 'Asignado', color: 'primary' },
  DERIVAR: { label: 'Derivado', color: 'warning' },
  OBSERVAR: { label: 'Observado', color: 'warning' },
  RESPONDER_OBSERVACION: { label: 'Obs. Respondida', color: 'info' },
  SOLICITAR_INTERVENCION_EXTERNA: { label: 'Req. Externo', color: 'warning' },
  RESPONDER_INTERVENCION_EXTERNA: { label: 'Req. Respondido', color: 'info' },
  APROBAR: { label: 'Aprobado', color: 'success' },
  RECHAZAR: { label: 'Rechazado', color: 'error' },
  CERRAR: { label: 'Cerrado', color: 'default' },
  CANCELAR: { label: 'Cancelado', color: 'error' },
};

export const UltimosMovimientosTable: React.FC<UltimosMovimientosTableProps> = ({
  movimientos,
}) => {
  return (
    <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Últimos Movimientos del Workflow
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/interno/bandeja"
            size="small"
            endIcon={<ArrowForwardIcon fontSize="small" />}
          >
            Ver Bandeja Completa
          </Button>
        </Box>

        {movimientos.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No se han registrado movimientos recientes en el sistema.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small" aria-label="tabla de ultimos movimientos">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Acción</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trámite</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Transición de Estado</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Operador / Actor</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fecha y Hora</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movimientos.map((m) => {
                  const cfg = ACCION_COLORS[m.accion] || { label: m.accion, color: 'default' };
                  const fechaStr = new Date(m.fecha).toLocaleString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <TableRow key={m.id} hover>
                      <TableCell>
                        <Chip
                          label={cfg.label}
                          color={cfg.color}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        {m.tramiteId ? (
                          <Typography
                            component={Link}
                            href={`/interno/tramites/${m.tramiteId}`}
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: 'primary.main',
                              textDecoration: 'none',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            Exp. {m.tramiteId.slice(0, 8)}...
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          {m.estadoAnterior && (
                            <>
                              <EstadoBadge estado={m.estadoAnterior as EstadoTramite} />
                              <Typography variant="caption" color="text.secondary">
                                →
                              </Typography>
                            </>
                          )}
                          <EstadoBadge estado={m.estadoNuevo as EstadoTramite} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {m.usuarioTipo === 'EXTERNO' ? 'Usuario Externo' : 'Operador Interno'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {m.usuarioId.slice(0, 8)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 500 }}
                        >
                          {fechaStr}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};
