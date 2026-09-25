import { NextResponse } from 'next/server';
import { talentCaller } from '@/lib/talent/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Basemaps offered in the map's view switcher. */
const STYLES = {
  light: { style: 'Monochrome', scheme: 'Light' },
  streets: { style: 'Standard', scheme: 'Light' },
  dark: { style: 'Monochrome', scheme: 'Dark' },
  satellite: { style: 'Hybrid', scheme: null },
} as const;

/**
 * The basemap style for the signed-in map.
 *
 * Amazon Location map tiles are fetched by the browser, so its key does reach
 * the page — but only for a signed-in user, not baked into the public bundle.
 * The key is restricted in AWS to map tiles and to this app's domains.
 * Without a key, a free low-detail world map keeps local development working.
 */
export async function GET(req: Request) {
  const who = await talentCaller();
  if (!who.ok) return who.response;

  const key = process.env.NEXT_TALENT_MAP_API_KEY;
  const region = process.env.NEXT_AWS_REGION ?? 'us-east-2';
  const requested = new URL(req.url).searchParams.get('style') as keyof typeof STYLES | null;
  const pick = STYLES[requested && requested in STYLES ? requested : 'light'];

  if (!key) {
    return NextResponse.json({ styleUrl: 'https://demotiles.maplibre.org/style.json', fallback: true });
  }
  const scheme = pick.scheme ? `&color-scheme=${pick.scheme}` : '';
  return NextResponse.json({
    styleUrl: `https://maps.geo.${region}.amazonaws.com/v2/styles/${pick.style}/descriptor?key=${encodeURIComponent(key)}${scheme}`,
    fallback: false,
  });
}
