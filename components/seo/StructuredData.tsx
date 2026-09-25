/**
 * Structured data (JSON-LD).
 *
 * Every claim repeats something stated on the page it is attached to, which
 * is both the rule for rich results and the honest thing to do. The FAQ
 * markup is built from the same list the FAQ page renders.
 */

import { FAQ_ITEMS, ORIGIN } from '@/lib/site/content';

type Crumb = { name: string; path: string };

function Json({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Server-rendered from literals in this repo; no user input reaches this.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const ORG = {
  '@type': 'Organization',
  '@id': `${ORIGIN}/#org`,
  name: 'Oceanblue Solutions',
  url: ORIGIN,
  logo: `${ORIGIN}/icon.svg`,
  email: 'oceanbluesolutions@gmail.com',
};

const APP = {
  '@type': 'SoftwareApplication',
  '@id': `${ORIGIN}/#app`,
  name: 'Blue-IQ Hire',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: ORIGIN,
  description:
    'Blue-IQ Hire reads a resume in PDF, Word or plain text, extracts every section word for word, checks the result against the original, and writes a submission-ready Word document in the format a state agency requires. It also ranks resumes against a job posting.',
  featureList: [
    'Word-for-word extraction of 20+ resume sections',
    'Coverage check against the source document',
    'Section-by-section editor before export',
    'Ohio, Pennsylvania, Georgia and Oceanblue templates',
    'Job matching with matched and missing skills',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@id': `${ORIGIN}/#org` },
};

/** Site-wide: the organisation, the product and the website. */
export default function StructuredData() {
  return (
    <Json
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          ORG,
          APP,
          {
            '@type': 'WebSite',
            '@id': `${ORIGIN}/#website`,
            url: ORIGIN,
            name: 'Blue-IQ Hire',
            publisher: { '@id': `${ORIGIN}/#org` },
          },
        ],
      }}
    />
  );
}

export function BreadcrumbData({ trail }: { trail: Crumb[] }) {
  return (
    <Json
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.name,
          item: `${ORIGIN}${c.path}`,
        })),
      }}
    />
  );
}

export function FaqData() {
  return (
    <Json
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${ORIGIN}/faq#faq`,
        mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      }}
    />
  );
}
