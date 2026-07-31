import type { Metadata } from 'next';
import { Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const instrument = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://truecopy.oceanbluesolutions.com'),
  title: {
    default: 'Truecopy: resumes set to the format the state requires',
    template: '%s · Truecopy',
  },
  description:
    'Upload a resume in PDF, Word, or text. Truecopy pulls out every section word for word, checks the result against the original, and writes a submission-ready document in the Ohio, Pennsylvania, Georgia, or Oceanblue template.',
  applicationName: 'Truecopy',
  keywords: [
    'resume formatting',
    'state resume template',
    'staffing submittal',
    'resume extraction',
    'DOCX resume converter',
  ],
  openGraph: {
    title: 'Truecopy: resumes set to the format the state requires',
    description:
      'Word-for-word extraction, a coverage audit against the source, and four submission-ready templates.',
    siteName: 'Truecopy',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrument.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-white font-sans text-tc-ink-2 antialiased">
        {children}
      </body>
    </html>
  );
}
