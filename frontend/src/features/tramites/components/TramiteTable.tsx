'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Tooltip,
  Typography,
  Box,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Link from 'next/link';
import { TramiteResumen } from '../interfaces/tramite.interface';
import { EstadoBadge } from '../../../shared/components/Badges/EstadoBadge';
import { PrioridadBadge } from '../../../shared/components/Badges/PrioridadBadge';
import { SlaBadge } from '../../../shared/components/Badges/SlaBadge';
import { EmptyState } from '../../../shared/components/Feedback/EmptyState';

interface TramiteTableProps {
  tramites: TramiteResumen[];
  total: number;
  skip: number;
  take: number;
  onPageChange: (newPage: number) => void;
  basePath?: string;
}

export const TramiteTable: React.FC<TramiteTableProps> = ({
  tramites,
  total,
  skip,
  take,
  onPageChange,
  basePath = '/interno/tramites',
}) => {
  if (tramites.length === 0) {
    return <EmptyState title="No hay trámites para mostrar" description="No se encontraron trámites con los filtros actuales." />;
  }

  const page = Math.floor(skip / take);

  return (
    <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: 700 }} aria-label="tabla de trámites">
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Número</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Título / Asunto</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tipo de Trámite</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Prioridad</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>SLA</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Fecha Creación</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tramites.map((row) => {
              const fecha = new Date(row.fechaCreacion).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });

              return (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                  component={Link}
                  href={`${basePath}/${row.id}`}
                >
                  <TableCell component="th" scope="row" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {row.numero}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {row.titulo}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {row.descripcion}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.tipoTramiteNombre}</Typography>
                  </TableCell>
                  <TableCell>
                    <EstadoBadge estado={row.estado} />
                  </TableCell>
                  <TableCell>
                    <PrioridadBadge prioridad={row.prioridad} />
                  </TableCell>
                  <TableCell>
                    <SlaBadge sla={row.sla} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {fecha}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Ver detalle del trámite">
                      <IconButton
                        component={Link}
                        href={`${basePath}/${row.id}`}
                        size="small"
                        color="primary"
                        aria-label={`Ver trámite ${row.numero}`}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[take]}
        component="div"
        count={total}
        rowsPerPage={take}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
      />
    </Paper>
  );
};
