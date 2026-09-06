import type { Metadata } from 'next';
import ThemeRegistry from '@/shared/theme/ThemeRegistry';

export const metadata: Metadata = {
  title: 'BPM de Trámites de Oficina',
  description: 'Plataforma integral para gestión y orquestación de trámites internos y externos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
