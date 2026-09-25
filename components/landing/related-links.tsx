import type { RelatedLink } from './Related';
import {
  IconFormat,
  IconMap,
  IconMatch,
  IconQuestion,
  IconShield,
  IconSteps,
  IconTemplates,
} from '@/components/ui/icons';

const tile = (node: React.ReactNode) => (
  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-tc-desk text-tc-azure transition-colors group-hover:bg-white">
    {node}
  </span>
);

const LINKS = {
  formatting: {
    href: '/formatting',
    title: 'Resume formatting',
    body: 'How a resume becomes a submission-ready document, word for word.',
    icon: tile(<IconFormat size={22} />),
  },
  matching: {
    href: '/matching',
    title: 'Job matching',
    body: 'Rank the resumes you already have against a new posting.',
    icon: tile(<IconMatch size={22} />),
  },
  map: {
    href: '/talent-map',
    title: 'Talent heat map',
    body: 'See which employers and metros hold the talent you place.',
    icon: tile(<IconMap size={22} />),
  },
  how: {
    href: '/how-it-works',
    title: 'How it works',
    body: 'The five passes every upload goes through, in order.',
    icon: tile(<IconSteps size={22} />),
  },
  templates: {
    href: '/templates',
    title: 'Templates',
    body: 'Ohio, Pennsylvania, Georgia and Oceanblue, side by side.',
    icon: tile(<IconTemplates size={22} />),
  },
  security: {
    href: '/security',
    title: 'Security',
    body: 'Where candidate data goes, and where it never goes.',
    icon: tile(<IconShield size={22} />),
  },
  faq: {
    href: '/faq',
    title: 'Questions',
    body: 'Files, fidelity, storage and matching, answered.',
    icon: tile(<IconQuestion size={22} />),
  },
} satisfies Record<string, RelatedLink>;

export const navTileFor = (key: keyof typeof LINKS): RelatedLink => LINKS[key];
