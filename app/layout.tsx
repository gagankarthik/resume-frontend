import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

// Geist carries the whole interface: tight, neutral and built for screens.
// The variable keeps its old name so every existing reference still resolves.
const sans = Geist({
  subsets: ['latin'],
  variable: '--font-public',
  display: 'swap',
});

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-plex-mono',
  display: 'swap',
});

// Canonical and Open Graph URLs are built from this. Amplify serves the same
// build from a CloudFront host and any custom domain, so it has to come from
// the environment rather than being hardcoded to one of them.
const ORIGIN =
  process.env.NEXT_APP_ORIGIN ??
  (process.env.AWS_APP_ID ? `https://${process.env.AWS_BRANCH}.${process.env.AWS_APP_ID}.amplifyapp.com` : null) ??
  'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(ORIGIN),
  title: {
    default: 'Blue-IQ Hire: resumes set to the format the state requires',
    template: '%s · Blue-IQ Hire',
  },
  description:
    'Upload a resume in PDF, Word, or text. Blue-IQ Hire pulls out every section word for word, checks the result against the original, and writes a submission-ready document in the Ohio, Pennsylvania, Georgia, or Oceanblue template.',
  applicationName: 'Blue-IQ Hire',
  keywords: [
    'resume formatting',
    'state resume template',
    'staffing submittal',
    'resume extraction',
    'DOCX resume converter',
  ],
  openGraph: {
    title: 'Blue-IQ Hire: resumes set to the format the state requires',
    description:
      'Word-for-word extraction, a coverage check against the source, four submission-ready templates, and job matching with reasons.',
    siteName: 'Blue-IQ Hire',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blue-IQ Hire',
    description: 'Resumes set to the format the state requires, word for word.',
  },
  robots: { index: true, follow: true },
  category: 'business',
};

export const viewport: Viewport = {
  themeColor: '#0B1830',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-white font-sans text-tc-ink-2 antialiased">
        {children}
      </body>
    </html>
  );
}
