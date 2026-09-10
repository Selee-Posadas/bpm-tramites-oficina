'use client';

import React, { useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PanToolIcon from '@mui/icons-material/PanTool';
import SendIcon from '@mui/icons-material/Send';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import LockIcon from '@mui/icons-material/Lock';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplyIcon from '@mui/icons-material/Reply';

import { WorkflowActionBarProps, WorkflowDialogType, WorkflowDialogConfigItem } from '../interfaces/tramite.interface';
import { RolInterno, TipoUsuario } from '../../auth/interfaces/auth.interface';
import { ConfirmDialog } from '../../../shared/components/Feedback/ConfirmDialog';
import { DerivarModal } from './DerivarModal';

export const WorkflowActionBar: React.FC<WorkflowActionBarProps> = ({
  tramite,
  user,
  areas = [],
  isActionLoading = false,
  onIngresar,
  onTomar,
  onAsignar,
  onDerivar,
  onObservar,
  onResponderObservacion,
  onSolicitarIntervencionExterna,
  onResponderIntervencionExterna,
  onAprobar,
  onRechazar,
  onCerrar,
  onCancelar,
}) => {
  const [activeDialog, setActiveDialog] = useState<WorkflowDialogType>(null);

  if (!user) return null;

  const isInterno = user.tipo === TipoUsuario.INTERNO;
  const isExterno = user.tipo === TipoUsuario.EXTERNO;
  const rol = user.rolInterno;

  if (rol === RolInterno.AUDITOR) {
    return (
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', mt: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
          Vista de solo lectura (Rol Auditor). No cuenta con permisos para ejecutar transiciones operativas sobre este trámite.
        </Typography>
      </Paper>
    );
  }

  const estado = tramite.estado;
  const isCircuitoExternoInterno = tramite.origen === 'EXTERNO_INTERNO' || tramite.origen === 'EXTERNO';
  const isCircuitoInternoInterno = tramite.origen === 'INTERNO_INTERNO';
  const isCircuitoInternoExterno = tramite.origen === 'INTERNO_EXTERNO';

  const dialogConfigs: Record<string, WorkflowDialogConfigItem> = {
    INGRESAR: {
      title: 'Ingresar Trámite',
      description: '¿Confirma el ingreso formal del trámite para su revisión operativa?',
      confirmText: 'Ingresar',
      confirmColor: 'primary',
      execute: () => onIngresar(),
    },
    TOMAR: {
      title: 'Tomar Trámite',
      description: 'Al tomar este trámite, usted quedará asignado como operador responsable de su gestión.',
      confirmText: 'Tomar',
      confirmColor: 'primary',
      execute: () => onTomar(),
    },
    APROBAR: {
      title: 'Aprobar Trámite',
      description: '¿Confirma la resolución favorable y aprobación formal del trámite?',
      confirmText: 'Aprobar Trámite',
      confirmColor: 'success',
      requireReason: true,
      reasonLabel: 'Dictamen / Motivo de Aprobación',
      execute: (motivo) => onAprobar(motivo),
    },
    RECHAZAR: {
      title: 'Rechazar Trámite',
      description: 'Esta acción rechazará el trámite indicando los fundamentos al solicitante.',
      confirmText: 'Rechazar Trámite',
      confirmColor: 'error',
      requireReason: true,
      reasonLabel: 'Fundamento del Rechazo (Obligatorio)',
      execute: (motivo) => onRechazar(motivo || ''),
    },
    OBSERVAR: {
      title: 'Observar Trámite',
      description: 'El trámite pasará a estado OBSERVADO y se requerirá una subsanación al solicitante.',
      confirmText: 'Enviar Observación',
      confirmColor: 'warning',
      requireReason: true,
      reasonLabel: 'Detalle de la Observación (Obligatorio)',
      execute: (motivo) => onObservar(motivo || ''),
    },
    RESPONDER_OBSERVACION: {
      title: 'Responder a la Observación',
      description: 'Ingrese su descargo o aclaración para que el operador continúe con la revisión.',
      confirmText: 'Enviar Descargo',
      confirmColor: 'warning',
      requireReason: true,
      reasonLabel: 'Respuesta / Aclaración (Obligatorio)',
      execute: (resp) => onResponderObservacion(resp || ''),
    },
    SOLICITAR_INTERVENCION: {
      title: 'Solicitar Intervención Externa',
      description: 'El trámite pasará a ESPERANDO_EXTERNO solicitando documentación o respuesta adicional.',
      confirmText: 'Solicitar Intervención',
      confirmColor: 'info',
      requireReason: true,
      reasonLabel: 'Requerimiento para el externo (Obligatorio)',
      execute: (motivo) => onSolicitarIntervencionExterna(motivo || ''),
    },
    RESPONDER_INTERVENCION: {
      title: 'Responder Intervención Externa',
      description: 'Envíe su respuesta o confirmación del requerimiento solicitado.',
      confirmText: 'Responder',
      confirmColor: 'info',
      requireReason: true,
      reasonLabel: 'Respuesta al Requerimiento (Obligatorio)',
      execute: (resp) => onResponderIntervencionExterna(resp || ''),
    },
    CERRAR: {
      title: 'Cerrar Trámite',
      description: 'Se archivará y finalizará el ciclo de vida del trámite de manera definitiva.',
      confirmText: 'Cerrar Trámite',
      confirmColor: 'primary',
      requireReason: false,
      reasonLabel: 'Nota de Cierre (Opcional)',
      execute: (motivo) => onCerrar(motivo),
    },
    CANCELAR: {
      title: 'Cancelar Trámite',
      description: '¿Está seguro de que desea cancelar este trámite? Esta acción es irreversible.',
      confirmText: 'Cancelar Trámite',
      confirmColor: 'error',
      requireReason: true,
      reasonLabel: 'Motivo de la Cancelación (Obligatorio)',
      execute: (motivo) => onCancelar(motivo || ''),
    },
  };

  const currentConfig = activeDialog && activeDialog !== 'DERIVAR' ? dialogConfigs[activeDialog] : null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1.5,
        alignItems: 'center',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mr: 1, color: 'text.secondary' }}>
        Acciones Disponibles:
      </Typography>

      {isExterno && estado === 'OBSERVADO' && (
        <Button
          variant="contained"
          color="warning"
          startIcon={<ReplyIcon />}
          onClick={() => setActiveDialog('RESPONDER_OBSERVACION')}
          disabled={isActionLoading}
        >
          Responder Observación
        </Button>
      )}

      {isExterno && estado === 'ESPERANDO_EXTERNO' && (
        <Button
          variant="contained"
          color="info"
          startIcon={<ReplyIcon />}
          onClick={() => setActiveDialog('RESPONDER_INTERVENCION')}
          disabled={isActionLoading}
        >
          Responder Intervención Solicitada
        </Button>
      )}

      {isExterno && estado === 'BORRADOR' && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<SendIcon />}
          onClick={() => setActiveDialog('INGRESAR')}
          disabled={isActionLoading}
        >
          Ingresar Trámite
        </Button>
      )}

      {isInterno && estado === 'BORRADOR' && isCircuitoExternoInterno && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', px: 1 }}>
          Trámite en preparación por el solicitante externo. El ingreso formal debe ser efectuado por el usuario externo.
        </Typography>
      )}

      {isInterno && estado === 'BORRADOR' && !isCircuitoExternoInterno && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<SendIcon />}
          onClick={() => setActiveDialog('INGRESAR')}
          disabled={isActionLoading}
        >
          Ingresar a Revisión
        </Button>
      )}

      {isInterno && (estado === 'INGRESADO' || estado === 'DERIVADO') && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<PanToolIcon />}
          onClick={() => setActiveDialog('TOMAR')}
          disabled={isActionLoading}
        >
          Tomar Trámite
        </Button>
      )}

      {isInterno && estado === 'INGRESADO' && isCircuitoInternoExterno && (
        <Button
          variant="contained"
          color="info"
          startIcon={<ContactSupportIcon />}
          onClick={() => setActiveDialog('SOLICITAR_INTERVENCION')}
          disabled={isActionLoading}
        >
          Solicitar Intervención Externa
        </Button>
      )}

      {isInterno && estado === 'EN_REVISION' && (
        <>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleOutlineIcon />}
            onClick={() => setActiveDialog('APROBAR')}
            disabled={isActionLoading}
          >
            Aprobar
          </Button>

          <Button
            variant="contained"
            color="error"
            startIcon={<HighlightOffIcon />}
            onClick={() => setActiveDialog('RECHAZAR')}
            disabled={isActionLoading}
          >
            Rechazar
          </Button>

          {isCircuitoExternoInterno && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<VisibilityOffIcon />}
              onClick={() => setActiveDialog('OBSERVAR')}
              disabled={isActionLoading}
            >
              Observar
            </Button>
          )}

          {isCircuitoInternoInterno && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AltRouteIcon />}
              onClick={() => setActiveDialog('DERIVAR')}
              disabled={isActionLoading}
            >
              Derivar a Otra Área
            </Button>
          )}

          {isCircuitoInternoExterno && (
            <Button
              variant="outlined"
              color="info"
              startIcon={<ContactSupportIcon />}
              onClick={() => setActiveDialog('SOLICITAR_INTERVENCION')}
              disabled={isActionLoading}
            >
              Solicitar Intervención Externa
            </Button>
          )}
        </>
      )}

      {isInterno && (estado === 'APROBADO' || estado === 'RECHAZADO' || estado === 'CANCELADO') && (
        <Button
          variant="contained"
          color="inherit"
          startIcon={<LockIcon />}
          onClick={() => setActiveDialog('CERRAR')}
          disabled={isActionLoading}
          sx={{ bgcolor: '#334155', color: '#ffffff', '&:hover': { bgcolor: '#1e293b' } }}
        >
          Cerrar Trámite Definitivamente
        </Button>
      )}

      {estado !== 'CERRADO' && estado !== 'CANCELADO' && (
        <Button
          variant="text"
          color="error"
          startIcon={<CancelIcon />}
          onClick={() => setActiveDialog('CANCELAR')}
          disabled={isActionLoading}
        >
          Cancelar Trámite
        </Button>
      )}

      {currentConfig && (
        <ConfirmDialog
          open={true}
          title={currentConfig.title}
          description={currentConfig.description}
          confirmText={currentConfig.confirmText}
          confirmColor={currentConfig.confirmColor}
          requireReason={currentConfig.requireReason}
          reasonLabel={currentConfig.reasonLabel}
          isLoading={isActionLoading}
          onConfirm={async (reason) => {
            await currentConfig.execute(reason);
            setActiveDialog(null);
          }}
          onClose={() => setActiveDialog(null)}
        />
      )}

      <DerivarModal
        open={activeDialog === 'DERIVAR'}
        areas={areas}
        areaActualId={tramite.areaActualId}
        isLoading={isActionLoading}
        onClose={() => setActiveDialog(null)}
        onConfirm={async (areaDestinoId, motivo) => {
          const ok = await onDerivar(areaDestinoId, motivo);
          if (ok) {
            setActiveDialog(null);
          }
          return ok;
        }}
      />
    </Paper>
  );
};
