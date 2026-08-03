/**
 * Structured data for the landing page.
 *
 * Describes what the product is and answers the questions people actually
 * search for, so a result can carry an FAQ rich snippet. Every claim here
 * repeats something stated on the page itself, which is both the rule for
 * FAQ markup and the honest thing to do.
 */

const ORIGIN = process.env.NEXT_APP_ORIGIN ?? 'https://hire.oceanbluecorp.com';

const FAQ = [
  {
    q: 'What file types can I upload to Hire?',
    a: 'PDF, Word (.docx and .doc), and plain text, up to 20 MB. Scanned pages are read with OCR.',
  },
  {
    q: 'Does Hire reword a resume?',
    a: 'No. Bullets and descriptions are copied character for character. Only the layout changes.',
  },
  {
    q: 'What happens if a section is missed?',
    a: 'The extracted record is checked against the original before you see it, and anything missing is flagged at the top of the editor.',
  },
  {
    q: 'Is candidate data stored?',
    a: 'The upload is held in memory for the request and never written to disk. The extracted record stays in your browser until you clear it.',
  },
  {
    q: 'Can one resume be exported to several state formats?',
    a: 'Yes. Extract once, then export to the Ohio, Pennsylvania, Georgia, or Oceanblue template without re-uploading.',
  },
];

export default function StructuredData() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${ORIGIN}/#app`,
        name: 'Hire',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: ORIGIN,
        description:
          'Hire reads a resume in PDF, Word, or plain text, extracts every section word for word, checks the result against the original, and writes a submission-ready Word document in the format a state agency requires.',
        featureList: [
          'Word-for-word extraction of 20+ resume sections',
          'Coverage check against the source document',
          'Section-by-section editor before export',
          'Ohio, Pennsylvania, Georgia, and Oceanblue templates',
        ],
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        publisher: { '@id': `${ORIGIN}/#org` },
      },
      {
        '@type': 'Organization',
        '@id': `${ORIGIN}/#org`,
        name: 'Oceanblue Solutions',
        url: ORIGIN,
        email: 'oceanbluesolutions@gmail.com',
      },
      {
        '@type': 'FAQPage',
        '@id': `${ORIGIN}/#faq`,
        mainEntity: FAQ.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Server-rendered from a literal above; no user input reaches this.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
