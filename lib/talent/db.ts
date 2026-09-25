import 'server-only';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  type QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';
import type { CompanyProfile } from './types';

/**
 * The talent map's own state — not the resumes. Those live in
 * `resume-extractions` (see extractions.ts). This table holds what the team
 * adds on top, keyed so a tenant only ever reads its own partition:
 *
 *   pk                     sk                   item
 *   T#<tenant>             C#<companyKey>       company profile (status, website, …)
 *   T#<tenant>             H#<person id>        person hidden from the map
 *   U#<tenant>#<user>      S#<id>               saved search
 *   A#<tenant>             <iso>#<rand>         audit entry (expires)
 *   GEO                    <query>              geocode cache (expires)
 *
 * Credentials come from the default AWS chain: the Amplify compute role in
 * production, a local profile in development. No keys live in env files.
 */

export function talentConfigured(): boolean {
  return Boolean(process.env.NEXT_TALENT_TABLE);
}

let doc: DynamoDBDocumentClient | null = null;
export function client(): DynamoDBDocumentClient {
  doc ??= DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.NEXT_AWS_REGION ?? 'us-east-2' }), {
    marshallOptions: { removeUndefinedValues: true },
  });
  return doc;
}

const TABLE = () => {
  const t = process.env.NEXT_TALENT_TABLE;
  if (!t) throw new Error('NEXT_TALENT_TABLE is not set.');
  return t;
};

const tpk = (tenant: string) => `T#${tenant}`;

/** Drop the table's own key attributes from an item before handing it back. */
function strip<T>(item: Record<string, unknown>): T {
  const { pk, sk, ...rest } = item;
  void pk;
  void sk;
  return rest as T;
}

async function queryAll(input: Omit<QueryCommandInput, 'TableName'>): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = [];
  let start: Record<string, unknown> | undefined;
  do {
    const res = await client().send(new QueryCommand({ ...input, TableName: TABLE(), ExclusiveStartKey: start }));
    out.push(...(res.Items ?? []));
    start = res.LastEvaluatedKey;
  } while (start);
  return out;
}

const byPrefix = (pk: string, prefix: string) =>
  queryAll({
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :p)',
    ExpressionAttributeValues: { ':pk': pk, ':p': prefix },
  });

/* ── Hidden people ───────────────────────────────────────────────────────── */

const hiddenCache = new Map<string, { at: number; ids: Set<string> }>();
const HIDDEN_TTL_MS = 10_000;

export async function listHidden(tenant: string): Promise<Set<string>> {
  const hit = hiddenCache.get(tenant);
  if (hit && Date.now() - hit.at < HIDDEN_TTL_MS) return hit.ids;
  const ids = new Set((await byPrefix(tpk(tenant), 'H#')).map(i => String(i.sk).slice(2)));
  hiddenCache.set(tenant, { at: Date.now(), ids });
  return ids;
}

/** Take a person off the map — for a deletion request, or a resume that should not count. */
export async function hideRecord(tenant: string, id: string, by: string): Promise<void> {
  await client().send(
    new PutCommand({ TableName: TABLE(), Item: { pk: tpk(tenant), sk: `H#${id}`, hiddenAt: new Date().toISOString(), by } }),
  );
  hiddenCache.delete(tenant);
}

/* ── Company profiles ────────────────────────────────────────────────────── */

export async function listCompanies(tenant: string): Promise<Map<string, CompanyProfile>> {
  const rows = await byPrefix(tpk(tenant), 'C#');
  return new Map(rows.map(r => {
    const c = strip<CompanyProfile>(r);
    return [c.key, c];
  }));
}

export async function getCompany(tenant: string, key: string): Promise<CompanyProfile | null> {
  const res = await client().send(new GetCommand({ TableName: TABLE(), Key: { pk: tpk(tenant), sk: `C#${key}` } }));
  return res.Item ? strip<CompanyProfile>(res.Item) : null;
}

export async function putCompanies(tenant: string, list: CompanyProfile[]): Promise<void> {
  for (let i = 0; i < list.length; i += 25) {
    await client().send(
      new BatchWriteCommand({
        RequestItems: {
          [TABLE()]: list.slice(i, i + 25).map(c => ({ PutRequest: { Item: { pk: tpk(tenant), sk: `C#${c.key}`, ...c } } })),
        },
      }),
    );
  }
}

/* ── Saved searches ──────────────────────────────────────────────────────── */

export type SavedSearch = { id: string; name: string; mode: string; filters: unknown; createdAt: string };

const upk = (tenant: string, user: string) => `U#${tenant}#${user}`;

export async function listSearches(tenant: string, user: string): Promise<SavedSearch[]> {
  const rows = await byPrefix(upk(tenant, user), 'S#');
  return rows.map(r => strip<SavedSearch>(r)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function putSearch(tenant: string, user: string, s: SavedSearch): Promise<void> {
  await client().send(new PutCommand({ TableName: TABLE(), Item: { pk: upk(tenant, user), sk: `S#${s.id}`, ...s } }));
}

export async function deleteSearch(tenant: string, user: string, id: string): Promise<void> {
  await client().send(new DeleteCommand({ TableName: TABLE(), Key: { pk: upk(tenant, user), sk: `S#${id}` } }));
}

/* ── Audit ───────────────────────────────────────────────────────────────── */

const YEAR_S = 365 * 24 * 3600;

/** Who viewed or exported what. Kept a year, then expires on its own. */
export async function audit(tenant: string, user: string, action: string, detail?: Record<string, unknown>) {
  const now = new Date();
  try {
    await client().send(
      new PutCommand({
        TableName: TABLE(),
        Item: {
          pk: `A#${tenant}`,
          sk: `${now.toISOString()}#${Math.random().toString(36).slice(2, 8)}`,
          action,
          user,
          detail,
          ttl: Math.floor(now.getTime() / 1000) + YEAR_S,
        },
      }),
    );
  } catch {
    // An audit write failing must not take the map down with it.
  }
}

/* ── Geocode cache ───────────────────────────────────────────────────────── */

export type GeoHit = { lat: number; lng: number; label: string; city?: string; region?: string; postal?: string; country?: string };

export async function getGeo(query: string): Promise<GeoHit | null | undefined> {
  const res = await client().send(new GetCommand({ TableName: TABLE(), Key: { pk: 'GEO', sk: query } }));
  if (!res.Item) return undefined;
  return res.Item.miss ? null : (res.Item.hit as GeoHit);
}

export async function putGeo(query: string, hit: GeoHit | null): Promise<void> {
  await client().send(
    new PutCommand({
      TableName: TABLE(),
      Item: {
        pk: 'GEO',
        sk: query,
        ...(hit ? { hit } : { miss: true }),
        ttl: Math.floor(Date.now() / 1000) + (hit ? 180 : 7) * 24 * 3600,
      },
    }),
  );
}
