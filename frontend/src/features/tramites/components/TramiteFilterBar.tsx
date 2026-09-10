'use client';

import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Grid2 as Grid,
  Paper,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { TramiteFiltros, TramiteFilterBarProps } from '../interfaces/tramite.interface';
import { Area } from '../../areas/interfaces/area.interface';
import { TipoTramite } from '../../tipos-tramite/interfaces/tipo-tramite.interface';

export const TramiteFilterBar: React.FC<TramiteFilterBarProps> = ({
  filtros,
  areas,
  tiposTramite,
  onFiltrosChange,
  onReset,
  rolUsuario,
  areaUsuarioId,
}) => {
  const esAreaRestringida = (rolUsuario === 'OPERADOR' || rolUsuario === 'SUPERVISOR') && Boolean(areaUsuarioId);

  return (
    <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            id="filtro-busqueda-input"
            name="busqueda"
            label="Buscar por título o número"
            variant="outlined"
            size="small"
            fullWidth
            value={filtros.busqueda || ''}
            onChange={(e) => onFiltrosChange({ busqueda: e.target.value })}
            placeholder="Ej: TR-2026-..."
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            id="filtro-estado-select"
            name="estado"
            select
            label="Estado"
            variant="outlined"
            size="small"
            fullWidth
            value={filtros.estado || ''}
            onChange={(e) => onFiltrosChange({ estado: e.target.value || undefined })}
          >
            <MenuItem value="">Todos los Estados</MenuItem>
            <MenuItem value="BORRADOR">Borrador</MenuItem>
            <MenuItem value="INGRESADO">Ingresado</MenuItem>
            <MenuItem value="EN_REVISION">En Revisión</MenuItem>
            <MenuItem value="OBSERVADO">Observado</MenuItem>
            <MenuItem value="DERIVADO">Derivado</MenuItem>
            <MenuItem value="ESPERANDO_EXTERNO">Esperando Externo</MenuItem>
            <MenuItem value="ESPERANDO_INTERNO">Esperando Interno</MenuItem>
            <MenuItem value="APROBADO">Aprobado</MenuItem>
            <MenuItem value="RECHAZADO">Rechazado</MenuItem>
            <MenuItem value="CERRADO">Cerrado</MenuItem>
            <MenuItem value="CANCELADO">Cancelado</MenuItem>
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            id="filtro-area-select"
            name="areaId"
            select
            label="Área Asignada"
            variant="outlined"
            size="small"
            fullWidth
            disabled={esAreaRestringida}
            helperText={esAreaRestringida ? 'Fija según tu área y rol' : undefined}
            value={esAreaRestringida ? (areaUsuarioId || '') : (filtros.areaId || '')}
            onChange={(e) => onFiltrosChange({ areaId: e.target.value || undefined })}
          >
            {!esAreaRestringida && <MenuItem value="">Todas las Áreas</MenuItem>}
            {areas.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            id="filtro-prioridad-select"
            name="prioridad"
            select
            label="Prioridad"
            variant="outlined"
            size="small"
            fullWidth
            value={filtros.prioridad || ''}
            onChange={(e) => onFiltrosChange({ prioridad: e.target.value || undefined })}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="BAJA">Baja</MenuItem>
            <MenuItem value="MEDIA">Media</MenuItem>
            <MenuItem value="ALTA">Alta</MenuItem>
            <MenuItem value="URGENTE">Urgente</MenuItem>
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            id="filtro-fecha-desde-input"
            name="fechaDesde"
            type="date"
            label="Fecha Desde"
            variant="outlined"
            size="small"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={filtros.fechaDesde || ''}
            onChange={(e) => onFiltrosChange({ fechaDesde: e.target.value || undefined })}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            id="filtro-fecha-hasta-input"
            name="fechaHasta"
            type="date"
            label="Fecha Hasta"
            variant="outlined"
            size="small"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={filtros.fechaHasta || ''}
            onChange={(e) => onFiltrosChange({ fechaHasta: e.target.value || undefined })}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControlLabel
            control={
              <Switch
                id="filtro-solo-vencidos-switch"
                name="soloVencidos"
                checked={!!filtros.soloVencidos}
                onChange={(e) => onFiltrosChange({ soloVencidos: e.target.checked })}
                color="error"
              />
            }
            label="Solo SLA Vencido"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            fullWidth
            onClick={onReset}
            startIcon={<RestartAltIcon />}
            sx={{ height: 40 }}
          >
            Limpiar
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};
