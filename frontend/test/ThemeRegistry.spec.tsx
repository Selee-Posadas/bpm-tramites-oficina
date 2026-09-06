import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ThemeRegistry from '@/shared/theme/ThemeRegistry';
import { Typography } from '@mui/material';

describe('ThemeRegistry', () => {
  it('should render children within MUI ThemeProvider', () => {
    render(
      <ThemeRegistry>
        <Typography variant="h1">Test BPM</Typography>
      </ThemeRegistry>,
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Test BPM');
  });
});
