'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTiposTramite } from '@/features/tipos-tramite/hooks/useTiposTramite';
import { TramiteCreateForm } from '@/features/tramites/components/TramiteCreateForm';
import { TramiteActions } from '@/features/tramites/actions/tramite.actions';
import { CreateTramiteRequestDto } from '@/features/tramites/interfaces/tramite.api.interface';
import { useNotification } from '@/shared/context/NotificationContext';
import { LoadingSkeleton } from '@/shared/components/Feedback/LoadingSkeleton';

export default function NuevoTramiteExternoPage() {
  const router = useRouter();
  const { tiposTramite, isLoading } = useTiposTramite(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess } = useNotification();

  const tiposPermitidos = tiposTramite.filter((t) => t.permiteInicioExterno);

  const handleSubmit = async (values: CreateTramiteRequestDto) => {
    setIsSubmitting(true);
    try {
      const result = await TramiteActions.crear(values);
      showSuccess(`Su trámite ha sido registrado con el número ${result.numero}. Ingrese documentación si es requerida.`);
      router.push(`/externo/tramites/${result.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
        <LoadingSkeleton rows={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      <TramiteCreateForm
        tiposTramite={tiposPermitidos}
        isInternal={false}
        isLoading={isSubmitting}
        backHref="/externo/mis-tramites"
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
