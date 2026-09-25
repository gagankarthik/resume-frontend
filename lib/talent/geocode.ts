import 'server-only';
import { GeoPlacesClient, GeocodeCommand } from '@aws-sdk/client-geo-places';
import { getGeo, putGeo, type GeoHit } from './db';

/**
 * Work locations to coordinates, through Amazon Location Service.
 *
 * Two cache layers, so a city that appears on a thousand resumes is looked up
 * once: this process's memory, then the talent table (hits kept six months,
 * misses a week). A failed lookup is not cached, so it is retried next time.
 */

let places: GeoPlacesClient | null = null;
const geoClient = () => (places ??= new GeoPlacesClient({ region: process.env.NEXT_AWS_REGION ?? 'us-east-2' }));

const memo = new Map<string, Promise<GeoHit | null>>();
const keyOf = (q: string) => q.toLowerCase().replace(/\s+/g, ' ').trim();

async function lookup(query: string, key: string): Promise<GeoHit | null> {
  const cached = await getGeo(key).catch(() => undefined);
  if (cached !== undefined) return cached;

  let hit: GeoHit | null = null;
  try {
    const res = await geoClient().send(new GeocodeCommand({ QueryText: query, MaxResults: 1 }));
    const item = res.ResultItems?.[0];
    const pos = item?.Position;
    if (item && pos?.length === 2) {
      hit = {
        lng: pos[0],
        lat: pos[1],
        label: item.Address?.Label ?? item.Title ?? query,
        city: item.Address?.Locality,
        region: item.Address?.Region?.Code ?? item.Address?.Region?.Name,
        postal: item.Address?.PostalCode,
        country: item.Address?.Country?.Code2,
      };
    }
  } catch {
    memo.delete(key);
    return null;
  }

  await putGeo(key, hit).catch(() => {});
  return hit;
}

export function geocode(query: string): Promise<GeoHit | null> {
  const key = keyOf(query);
  let p = memo.get(key);
  if (!p) {
    p = lookup(query, key);
    memo.set(key, p);
  }
  return p;
}
