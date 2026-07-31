import type { MetadataRoute } from 'next';

const ORIGIN = process.env.NEXT_APP_ORIGIN ?? 'https://truecopy.oceanbluesolutions.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The working pages hold candidate data and need a session; there is
        // nothing there for a crawler to index.
        disallow: ['/api/', '/upload', '/editor', '/signin', '/signed-out'],
      },
    ],
    sitemap: `${ORIGIN}/sitemap.xml`,
    host: ORIGIN,
  };
}
