'use client';

import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { TipoTramiteTableProps } from '../interfaces/tipo-tramite.interface';

export function TipoTramiteTable({ tiposTramite, onEdit }: TipoTramiteTableProps) {
  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
      <Table sx={{ minWidth: 700 }} aria-label="tabla de tipos de tramite">
        <TableHead sx={{ bgcolor: '#f8fafc' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>SLA Base</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Inicio Externo</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Requiere Externo</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tiposTramite.map((tipo) => (
            <TableRow key={tipo.id} hover>
              <TableCell sx={{ fontWeight: 700 }}>{tipo.codigo}</TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{tipo.nombre}</Typography>
                <Typography variant="caption" color="text.secondary">{tipo.descripcion}</Typography>
              </TableCell>
              <TableCell>{tipo.slaHoras} horas</TableCell>
              <TableCell>
                <Chip
                  label={tipo.permiteInicioExterno ? 'Habilitado' : 'No'}
                  size="small"
                  color={tipo.permiteInicioExterno ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={tipo.requiereExterno ? 'Sí' : 'No'}
                  size="small"
                  color={tipo.requiereExterno ? 'info' : 'default'}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={tipo.activo ? 'Activo' : 'Inactivo'}
                  size="small"
                  color={tipo.activo ? 'primary' : 'error'}
                />
              </TableCell>
              <TableCell align="center">
                <Tooltip title="Editar configuración">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEdit(tipo)}
                    aria-label={`Editar tipo de trámite ${tipo.nombre}`}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
