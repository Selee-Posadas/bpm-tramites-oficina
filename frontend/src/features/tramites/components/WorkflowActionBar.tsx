'use client';

import React, { useState } from 'react';
import { Box, Button, Paper, Typography, CircularProgress, MenuItem, TextField } from '@mui/material';
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

import { TramiteDetalle } from '../interfaces/tramite.interface';
import { AuthUser, RolInterno, TipoUsuario } from '../../auth/interfaces/auth.interface';
import { Area } from '../../areas/interfaces/area.interface';
import { ConfirmDialog } from '../../../shared/components/Feedback/ConfirmDialog';

interface WorkflowActionBarProps {
  tramite: TramiteDetalle;
  user: AuthUser | null;
  areas?: Area[];
  isActionLoading?: boolean;
  onIngresar: () => Promise<boolean>;
  onTomar: () => Promise<boolean>;
  onAsignar: (operadorId: string, motivo?: string) => Promise<boolean>;
  onDerivar: (areaDestinoId: string, motivo?: string) => Promise<boolean>;
  onObservar: (motivo: string) => Promise<boolean>;
  onResponderObservacion: (respuesta: string) => Promise<boolean>;
  onSolicitarIntervencionExterna: (motivo: string) => Promise<boolean>;
  onResponderIntervencionExterna: (respuesta: string) => Promise<boolean>;
  onAprobar: (motivo?: string) => Promise<boolean>;
  onRechazar: (motivo: string) => Promise<boolean>;
  onCerrar: (motivo?: string) => Promise<boolean>;
  onCancelar: (motivo: string) => Promise<boolean>;
}

type DialogType =
  | 'INGRESAR'
  | 'TOMAR'
  | 'ASIGNAR'
  | 'DERIVAR'
  | 'OBSERVAR'
  | 'RESPONDER_OBSERVACION'
  | 'SOLICITAR_INTERVENCION'
  | 'RESPONDER_INTERVENCION'
  | 'APROBAR'
  | 'RECHAZAR'
  | 'CERRAR'
  | 'CANCELAR'
  | null;

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
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedOperadorId, setSelectedOperadorId] = useState<string>('');
  const [areaError, setAreaError] = useState<string>('');
  const [operadorError, setOperadorError] = useState<string>('');

  if (!user) return null;

  const isInterno = user.tipo === TipoUsuario.INTERNO;
  const isExterno = user.tipo === TipoUsuario.EXTERNO;
  const rol = user.rolInterno;

  const isAuditor = rol === RolInterno.AUDITOR;
  if (isAuditor) {
    return (
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', mt: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Perfil de solo lectura (Auditor): No posee permisos para ejecutar transiciones operativas sobre este trámite.
        </Typography>
      </Paper>
    );
  }

  const estado = tramite.estado;

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

      {isInterno && estado === 'BORRADOR' && (
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

          <Button
            variant="outlined"
            color="warning"
            startIcon={<VisibilityOffIcon />}
            onClick={() => setActiveDialog('OBSERVAR')}
            disabled={isActionLoading}
          >
            Observar
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AltRouteIcon />}
            onClick={() => setActiveDialog('DERIVAR')}
            disabled={isActionLoading}
          >
            Derivar a Otra Área
          </Button>

          <Button
            variant="outlined"
            color="info"
            startIcon={<ContactSupportIcon />}
            onClick={() => setActiveDialog('SOLICITAR_INTERVENCION')}
            disabled={isActionLoading}
          >
            Solicitar Intervención Externa
          </Button>
        </>
      )}

      {isInterno && (rol === RolInterno.SUPERVISOR || rol === RolInterno.ADMIN) && (
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AssignmentIndIcon />}
          onClick={() => setActiveDialog('ASIGNAR')}
          disabled={isActionLoading}
        >
          Asignar a Operador
        </Button>
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

      <ConfirmDialog
        open={activeDialog === 'INGRESAR'}
        title="Ingresar Trámite"
        description="¿Confirma el ingreso formal del trámite para su revisión operativa?"
        confirmText="Ingresar"
        confirmColor="primary"
        isLoading={isActionLoading}
        onConfirm={async () => {
          await onIngresar();
          setActiveDialog(null);
        }}
        onClose={() => setActiveDialog(null)}
      />

      <ConfirmDialog
        open={activeDialog === 'TOMAR'}
        title="Tomar Trámite"
        description="Al tomar este trámite, usted quedará asignado como operador responsable de su gestión."
        confirmText="Tomar"
        confirmColor="primary"
        isLoading={isActionLoading}
        onConfirm={async () => {
          await onTomar();
          setActiveDialog(null);
        }}
        onClose={() => setActiveDialog(null)}
      />

      <ConfirmDialog
        open={activeDialog === 'APROBAR'}
        title="Aprobar Trámite"
        description="¿Confirma la resolución favorable y aprobación formal del trámite?"
        confirmText="Aprobar Trámite"
        confirmColor="success"
        requireReason
        reasonLabel="Dictamen / Motivo de Aprobación"
        isLoading={isActionLoading}
        onConfirm={async (motivo) => {
          await onAprobar(motivo);
          setActiveDialog(null);
        }}
        onClose={() => setActiveDialog(null)}
      />

      <ConfirmDialog
        open={activeDialog === 'RECHAZAR'}
        title="Rechazar Trámite"
        description="Esta acción rechazará el trámite indicando los fundamentos al solicitante."
        confirmText="Rechazar Trámite"
        confirmColor="error"
        requireReason
        reasonLabel="Fundamento del Rechazo (Obligatorio)"
        isLoading={isActionLoading}
        onConfirm={async (motivo) => {
          if (motivo) {
            await onRechazar(motivo);
            setActiveDialog(null);
          }
        }}
        onClose={() => setActiveDialog(null)}
      />

      <ConfirmDialog
        open={activeDialog === 'OBSERVAR'}
        title="Observar Trámite"
        description="El trámite pasará a estado OBSERVADO y se requerirá una subsanación al solicitante."
        confirmText="Enviar Observación"
        confirmColor="warning"
        requireReason
        reasonLabel="Detalle de la Observación (Obligatorio)"
        isLoading={isActionLoading}
        onConfirm={async (motivo) => {
          if (motivo) {
            await onObservar(motivo);
            setActiveDialog(null);
          }
        }}
        onClose={() => setActiveDialog(null)}
      />

      <ConfirmDialog
        open={activeDialog === 'RESPONDER_OBSERVACION'}
        title="Responder a la Observación"
        description="Ingrese su descargo o aclaración para que el operador continúe con la revisión."
        confirmText="Enviar Descargo"
        confirmColor="warning"
        requireReason
        reasonLabel="Respuesta / Aclaración (Obligatorio)"
        isLoading={isActionLoading}
        onConfirm={async (respuesta) => {
          if (respuesta) {
            await onResponderObservacion(respuesta);
            setActiveDialog(null);
          }
        }}
        onClose={() => setActiveDialog(null)}
      />

      <ConfirmDialog
        open={activeDialog === 'SOLICITAR_INTERVENCION'}
        title="Solicitar Intervención Externa"
        description="El trámite pasará a ESPERANDO_EXTERNO solicitando documentación o respuesta adicional."
        confirmText="Solicitar Intervención"
        confirmColor="info"
        requireReason
        reasonLabel="Requerimiento para el externo (Obligatorio)"
        isLoading={isActionLoading}
        onConfirm={async (motivo) => {
          if (motivo) {
            await onSolicitarIntervencionExterna(motivo);
            setActiveDialog(null);
          }
        }}
        onClose={() => setActiveDialog(null)}
      />

      <ConfirmDialog
        open={activeDialog === 'RESPONDER_INTERVENCION'}
        title="Responder Intervención Externa"
        description="Envíe su respuesta o confirmación del requerimiento solicitado."
        confirmText="Responder"
        confirmColor="info"
        requireReason
        reasonLabel="Respuesta al Requerimiento (Obligatorio)"
        isLoading={isActionLoading}
        onConfirm={async (respuesta) => {
          if (respuesta) {
            await onResponderIntervencionExterna(respuesta);
            setActiveDialog(null);
          }
        }}
        onClose={() => setActiveDialog(null)}
      />

      <ConfirmDialog
        open={activeDialog === 'CERRAR'}
        title="Cerrar Trámite"
        description="Se archivará y finalizará el ciclo de vida del trámite de manera definitiva."
        confirmText="Cerrar Trámite"
        confirmColor="primary"
        requireReason
        reasonLabel="Nota de Cierre (Opcional)"
        isLoading={isActionLoading}
        onConfirm={async (motivo) => {
          await onCerrar(motivo);
          setActiveDialog(null);
        }}
        onClose={() => setActiveDialog(null)}
      />

      <ConfirmDialog
        open={activeDialog === 'CANCELAR'}
        title="Cancelar Trámite"
        description="¿Está seguro de que desea cancelar este trámite? Esta acción es irreversible."
        confirmText="Cancelar Trámite"
        confirmColor="error"
        requireReason
        reasonLabel="Motivo de la Cancelación (Obligatorio)"
        isLoading={isActionLoading}
        onConfirm={async (motivo) => {
          if (motivo) {
            await onCancelar(motivo);
            setActiveDialog(null);
          }
        }}
        onClose={() => setActiveDialog(null)}
      />

      {activeDialog === 'DERIVAR' && (
        <ConfirmDialog
          open={true}
          title="Derivar Trámite a Otra Área"
          description="Seleccione el área destino y el motivo de la derivación inter-área."
          confirmText="Derivar Trámite"
          confirmColor="secondary"
          requireReason
          reasonLabel="Motivo de la Derivación (Obligatorio)"
          isLoading={isActionLoading}
          onConfirm={async (motivo) => {
            if (!selectedAreaId) {
              setAreaError('Debe seleccionar el área de destino');
              return;
            }
            if (motivo) {
              await onDerivar(selectedAreaId, motivo);
              setActiveDialog(null);
              setSelectedAreaId('');
            }
          }}
          onClose={() => {
            setActiveDialog(null);
            setSelectedAreaId('');
            setAreaError('');
          }}
        />
      )}
    </Paper>
  );
};
