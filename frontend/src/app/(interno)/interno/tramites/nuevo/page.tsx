'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTiposTramite } from '@/features/tipos-tramite/hooks/useTiposTramite';
import { TramiteCreateForm } from '@/features/tramites/components/TramiteCreateForm';
import { TramiteActions } from '@/features/tramites/actions/tramite.actions';
import { CreateTramiteFormValues } from '@/features/tramites/interfaces/tramite.interface';
import { useNotification } from '@/shared/context/NotificationContext';
import { LoadingSkeleton } from '@/shared/components/Feedback/LoadingSkeleton';

export default function NuevoTramiteInternoPage() {
  const router = useRouter();
  const { tiposTramite, isLoading } = useTiposTramite(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess } = useNotification();

  const handleSubmit = async (values: CreateTramiteFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await TramiteActions.crear(values);
      showSuccess(`Trámite ${result.numero} creado exitosamente en estado Borrador.`);
      router.push(`/interno/tramites/${result.id}`);
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
        tiposTramite={tiposTramite}
        isInternal={true}
        isLoading={isSubmitting}
        backHref="/interno/bandeja"
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
