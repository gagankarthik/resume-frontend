import type { Metadata } from 'next';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ResumeKit — State Resume Format Converter',
  description:
    'Upload any resume and get submission-ready documents in Ohio, Pennsylvania, Georgia, and Oceanblue formats. Field-by-field extraction, line-by-line source audit, full editor.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body
        className="min-h-screen bg-white antialiased"
        style={{ fontFamily: 'var(--font-archivo), system-ui, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
