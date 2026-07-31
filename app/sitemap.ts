import type { MetadataRoute } from 'next';

const ORIGIN = process.env.NEXT_APP_ORIGIN ?? 'https://truecopy.oceanbluesolutions.com';

/** Only the publicly indexable pages. The signed-in app is excluded in robots.ts. */
const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1, changeFrequency: 'monthly' },
  { path: '/legal/privacy', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/legal/terms', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/legal/security', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/legal/data-processing', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/legal/cookies', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/legal/accessibility', priority: 0.3, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${ORIGIN}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
