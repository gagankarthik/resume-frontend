import type { ClientStatus } from '@/lib/talent/types';

/** Client-status colours, shared by the map, the table and the company card. */
export const STATUS_COLOR: Record<ClientStatus, string> = {
  client: '#0B8F68',
  target: '#B86E00',
  former: '#8C99AE',
  none: '#2A45D8',
};
