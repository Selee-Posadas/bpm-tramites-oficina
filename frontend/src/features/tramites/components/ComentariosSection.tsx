'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PublicIcon from '@mui/icons-material/Public';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ComentarioItem, ComentariosSectionProps } from '../interfaces/tramite.interface';
import { AuthUser, TipoUsuario } from '../../auth/interfaces/auth.interface';

export const ComentariosSection: React.FC<ComentariosSectionProps> = ({
  comentarios,
  user,
  isLoading = false,
  onAgregarComentario,
}) => {
  const isInterno = user?.tipo === TipoUsuario.INTERNO;

  const formik = useFormik({
    initialValues: {
      mensaje: '',
      visibilidad: (isInterno ? 'INTERNA' : 'TODOS') as 'INTERNA' | 'EXTERNA' | 'TODOS',
    },
    validationSchema: Yup.object({
      mensaje: Yup.string().trim().required('El mensaje no puede estar vacío').min(3, 'Mínimo 3 caracteres'),
      visibilidad: Yup.string().oneOf(['INTERNA', 'EXTERNA', 'TODOS']).required(),
    }),
    onSubmit: async (values, { resetForm }) => {
      const ok = await onAgregarComentario(values.mensaje.trim(), values.visibilidad);
      if (ok) {
        resetForm();
      }
    },
  });

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ mb: 3 }}>
        {comentarios.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center', fontStyle: 'italic' }}>
            No hay comentarios registrados en este trámite.
          </Typography>
        ) : (
          comentarios.map((c) => {
            const fecha = new Date(c.fecha).toLocaleString('es-AR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const esPrivado = c.visibilidad === 'INTERNA';

            return (
              <Paper
                key={c.id}
                elevation={0}
                sx={{
                  p: 2,
                  mb: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: esPrivado ? '#fed7aa' : '#e2e8f0',
                  bgcolor: esPrivado ? '#fff7ed' : '#ffffff',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {c.autorTipo === 'INTERNO' ? 'Operador Interno' : 'Usuario Externo'} ({c.autorId})
                    </Typography>
                    {isInterno && (
                      <Chip
                        icon={esPrivado ? <LockOutlinedIcon sx={{ fontSize: '14px !important' }} /> : <PublicIcon sx={{ fontSize: '14px !important' }} />}
                        label={c.visibilidad}
                        size="small"
                        color={esPrivado ? 'warning' : 'default'}
                        sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 600 }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {fecha}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.primary', whiteSpace: 'pre-wrap' }}>
                  {c.mensaje}
                </Typography>
              </Paper>
            );
          })
        )}
      </Box>

      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChatBubbleOutlineIcon fontSize="small" />
          Agregar Comentario
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <TextField
            id="comentario-mensaje-input"
            name="mensaje"
            label="Escriba su comentario u observación"
            multiline
            rows={3}
            fullWidth
            value={formik.values.mensaje}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.mensaje && Boolean(formik.errors.mensaje)}
            helperText={formik.touched.mensaje && formik.errors.mensaje}
            sx={{ bgcolor: '#ffffff', mb: 2 }}
          />

          <Box sx={{ display: 'flex', justifyContent: isInterno ? 'space-between' : 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            {isInterno && (
              <TextField
                id="comentario-visibilidad-select"
                name="visibilidad"
                select
                label="Visibilidad del comentario"
                size="small"
                value={formik.values.visibilidad}
                onChange={formik.handleChange}
                sx={{ minWidth: 200, bgcolor: '#ffffff' }}
              >
                <MenuItem value="INTERNA">Interna (Solo funcionarios)</MenuItem>
                <MenuItem value="EXTERNA">Externa (Visible para solicitante)</MenuItem>
                <MenuItem value="TODOS">Todos (Público)</MenuItem>
              </TextField>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
              disabled={isLoading || !formik.isValid}
            >
              Publicar Comentario
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};
