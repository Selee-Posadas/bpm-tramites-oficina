'use client';

import React from 'react';
import { Box, Skeleton, Card, CardContent } from '@mui/material';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Skeleton variant="rectangular" height={56} sx={{ mb: 2, borderRadius: 2 }} />
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          height={48}
          sx={{ mb: 1.5, borderRadius: 1, opacity: 1 - index * 0.15 }}
        />
      ))}
    </Box>
  );
};

export const CardDetailSkeleton: React.FC = () => {
  return (
    <Card sx={{ p: 2, mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Skeleton variant="text" width="40%" height={40} />
          <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 2 }} />
        </Box>
        <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
      </CardContent>
    </Card>
  );
};
