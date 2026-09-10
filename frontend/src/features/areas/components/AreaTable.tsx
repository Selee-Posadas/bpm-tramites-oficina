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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { AreaTableProps } from '../interfaces/area.interface';

export function AreaTable({ areas, onEdit }: AreaTableProps) {
  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
      <Table sx={{ minWidth: 600 }} aria-label="tabla de areas">
        <TableHead sx={{ bgcolor: '#f8fafc' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Nombre del Área</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {areas.map((area) => (
            <TableRow key={area.id} hover>
              <TableCell sx={{ fontWeight: 700 }}>{area.codigo}</TableCell>
              <TableCell>{area.nombre}</TableCell>
              <TableCell>
                <Chip
                  label={area.activa ? 'Activa' : 'Inactiva'}
                  size="small"
                  color={area.activa ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell align="center">
                <Tooltip title="Editar área">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEdit(area)}
                    aria-label={`Editar área ${area.nombre}`}
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
