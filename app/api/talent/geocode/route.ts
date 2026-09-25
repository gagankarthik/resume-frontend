import { NextResponse } from 'next/server';
import { geocode } from '@/lib/talent/geocode';
import { talentCaller } from '@/lib/talent/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Turn the address typed into the radius filter into a point. */
export async function GET(req: Request) {
  const who = await talentCaller();
  if (!who.ok) return who.response;

  const q = new URL(req.url).searchParams.get('q')?.trim().slice(0, 160);
  if (!q) return NextResponse.json({ detail: 'Enter a city, ZIP code or address.' }, { status: 400 });

  const hit = await geocode(q);
  if (!hit) return NextResponse.json({ detail: `No place found for “${q}”.` }, { status: 404 });
  return NextResponse.json({ lat: hit.lat, lng: hit.lng, label: hit.label });
}
