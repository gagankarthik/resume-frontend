import 'server-only';
import { inflateSync } from 'node:zlib';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { APIResponse } from '@/lib/types';
import { buildTalentRecord } from './record';
import { geocode } from './geocode';
import { client, listHidden } from './db';
import type { TalentRecord } from './types';

/**
 * The talent map's data: read straight from `resume-extractions`, the one table
 * the extraction engine writes every resume to — whichever product sent it.
 *
 * Nothing is copied into a second table. Each server instance keeps the map
 * records it has already built and, on every request, asks the table's time
 * index only for rows newer than the last one it saw. With nothing new, that is
 * a single empty query. Concurrent requests share one refresh.
 */

const TABLE = () => process.env.NEXT_TALENT_EXTRACTIONS_TABLE ?? 'resume-extractions';
const INDEX = 'by-created';
const GEOCODE_CONCURRENCY = 8;
/** How long a quiet table is trusted before it is asked again. */
const RECHECK_MS = 5_000;

type Cache = {
  cursor: string;
  /** Latest record per person: a re-upload replaces the earlier one. */
  byPerson: Map<string, TalentRecord>;
  checkedAt: number;
};

const g = globalThis as unknown as { __talentCache?: Map<string, Cache>; __talentInflight?: Map<string, Promise<void>> };
const caches = (g.__talentCache ??= new Map());
const inflight = (g.__talentInflight ??= new Map());

/** The organisation whose data the extractions are. Other tenants see an empty map. */
export function extractionsTenant(): string | undefined {
  return process.env.NEXT_TALENT_DEFAULT_TENANT;
}

async function mapLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) await fn(items[next++]);
  });
  await Promise.all(workers);
}

type Row = { id?: string; gsi1sk?: string; source?: string; createdAt?: string; result?: Uint8Array };

async function toRecord(tenant: string, row: Row): Promise<TalentRecord | null> {
  if (!row.result) return null;
  let api: APIResponse;
  try {
    api = JSON.parse(inflateSync(Buffer.from(row.result)).toString('utf8')) as APIResponse;
  } catch {
    return null;
  }
  const draft = buildTalentRecord(tenant, api);
  if (!draft) return null;

  const { query, ...base } = draft;
  const record: TalentRecord = {
    ...base,
    source: row.source,
    resumeDate: row.createdAt ?? base.resumeDate,
    locSource: 'none',
  };
  const hit = query ? await geocode(query) : null;
  if (!hit) return record;
  return {
    ...record,
    lat: Math.round(hit.lat * 1e5) / 1e5,
    lng: Math.round(hit.lng * 1e5) / 1e5,
    city: hit.city,
    region: hit.region,
    postal: hit.postal,
    country: hit.country,
    locSource: 'role',
    fieldConfidence: { ...record.fieldConfidence, location: 0.9 },
  };
}

async function refresh(tenant: string, cache: Cache): Promise<void> {
  const rows: Row[] = [];
  let start: Record<string, unknown> | undefined;
  do {
    const res = await client().send(
      new QueryCommand({
        TableName: TABLE(),
        IndexName: INDEX,
        KeyConditionExpression: cache.cursor ? 'gsi1pk = :p AND gsi1sk > :c' : 'gsi1pk = :p',
        ExpressionAttributeValues: cache.cursor ? { ':p': 'EXTRACTION', ':c': cache.cursor } : { ':p': 'EXTRACTION' },
        ProjectionExpression: 'id, gsi1sk, #s, createdAt, #r',
        ExpressionAttributeNames: { '#s': 'source', '#r': 'result' },
        ExclusiveStartKey: start,
      }),
    );
    rows.push(...((res.Items ?? []) as Row[]));
    start = res.LastEvaluatedKey;
  } while (start);

  // Built in parallel, applied in time order, so the newest resume wins.
  const built: (TalentRecord | null)[] = new Array(rows.length).fill(null);
  await mapLimit(rows.map((row, i) => ({ row, i })), GEOCODE_CONCURRENCY, async ({ row, i }) => {
    built[i] = await toRecord(tenant, row);
  });
  rows.forEach((row, i) => {
    const rec = built[i];
    if (rec) cache.byPerson.set(rec.id, rec);
    if (row.gsi1sk && row.gsi1sk > cache.cursor) cache.cursor = row.gsi1sk;
  });
  cache.checkedAt = Date.now();
}

export async function listRecords(tenant: string): Promise<TalentRecord[]> {
  if (tenant !== extractionsTenant()) return [];

  let cache = caches.get(tenant);
  if (!cache) {
    cache = { cursor: '', byPerson: new Map(), checkedAt: 0 };
    caches.set(tenant, cache);
  }

  if (Date.now() - cache.checkedAt > RECHECK_MS) {
    let run = inflight.get(tenant);
    if (!run) {
      run = refresh(tenant, cache).finally(() => inflight.delete(tenant));
      inflight.set(tenant, run);
    }
    await run;
  }

  const hidden = await listHidden(tenant);
  const out: TalentRecord[] = [];
  for (const rec of cache.byPerson.values()) if (!hidden.has(rec.id)) out.push(rec);
  return out;
}
