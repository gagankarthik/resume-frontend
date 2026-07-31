/**
 * What to call a candidate in a result list.
 *
 * The matching engine drops contact details when it parses a resume, so a
 * ranked result often carries no name — only its id, which is the filename it
 * was uploaded under. Recover the human part of that: the last segment, minus
 * any upload timestamp and placeholder marker.
 */
export function displayName(name: string | null | undefined, resumeId: string): string {
  const given = name?.trim();
  if (given) return given;

  const base = (resumeId.split('/').pop() ?? resumeId).replace(/\.[a-z0-9]+$/i, '');
  const tail =
    base
      .split('--')
      .filter(part => part && part.toLowerCase() !== 'unknown')
      .pop() ?? base;

  return (
    tail
      .replace(/^\d{8,}[-_\s]*/, '') // an upload timestamp, not a name
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'Unnamed candidate'
  );
}
