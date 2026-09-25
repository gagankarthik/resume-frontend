import type { MetadataRoute } from 'next';
import { ORIGIN, TEMPLATE_PAGES } from '@/lib/site/content';

/** Only the publicly indexable pages. The signed-in app is excluded in robots.ts. */
const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1, changeFrequency: 'monthly' },
  { path: '/formatting', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/matching', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/talent-map', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/how-it-works', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/templates', priority: 0.8, changeFrequency: 'monthly' },
  ...TEMPLATE_PAGES.map(t => ({ path: `/templates/${t.slug}`, priority: 0.7, changeFrequency: 'monthly' as const })),
  { path: '/security', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
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
