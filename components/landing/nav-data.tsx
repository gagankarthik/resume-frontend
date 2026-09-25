import type { ReactNode } from 'react';
import {
  IconFormat,
  IconLegal,
  IconMap,
  IconMail,
  IconMatch,
  IconQuestion,
  IconShield,
  IconSteps,
} from '@/components/ui/icons';
import { Emblem } from './illustrations/Emblems';
import { TEMPLATE_PAGES } from '@/lib/site/content';

export type NavItem = {
  href: string;
  title: string;
  body: string;
  icon: ReactNode;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
  /** Two-column panel for the longer menus. */
  wide?: boolean;
  footer?: { href: string; label: string };
};

const tile = (node: ReactNode) => (
  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-tc-desk text-tc-azure transition-colors group-hover:bg-white">
    {node}
  </span>
);

export const NAV: NavGroup[] = [
  {
    label: 'Product',
    items: [
      {
        href: '/formatting',
        title: 'Resume formatting',
        body: 'Copy a resume word for word into the state’s template',
        icon: tile(<IconFormat size={20} />),
      },
      {
        href: '/matching',
        title: 'Job matching',
        body: 'Rank your resumes against a posting, with the reasons',
        icon: tile(<IconMatch size={20} />),
      },
      {
        href: '/talent-map',
        title: 'Talent heat map',
        body: 'See where talent sits, by employer, skill and metro',
        icon: tile(<IconMap size={20} />),
      },
      {
        href: '/how-it-works',
        title: 'How it works',
        body: 'The five passes every document goes through',
        icon: tile(<IconSteps size={20} />),
      },
    ],
  },
  {
    label: 'Templates',
    wide: true,
    items: TEMPLATE_PAGES.map(t => ({
      href: `/templates/${t.slug}`,
      title: t.name,
      body: t.blurb,
      icon: <Emblem id={t.id} size={40} />,
    })),
    footer: { href: '/templates', label: 'Compare all four templates' },
  },
  {
    label: 'Company',
    items: [
      {
        href: '/security',
        title: 'Security',
        body: 'Where candidate data goes, and where it doesn’t',
        icon: tile(<IconShield size={20} />),
      },
      {
        href: '/faq',
        title: 'Questions',
        body: 'Files, fidelity, storage and matching',
        icon: tile(<IconQuestion size={20} />),
      },
      {
        href: '/legal/privacy',
        title: 'Legal',
        body: 'Privacy, terms and data processing',
        icon: tile(<IconLegal size={20} />),
      },
      {
        href: 'mailto:oceanbluesolutions@gmail.com',
        title: 'Contact support',
        body: 'Email the team behind Blue-IQ Hire',
        icon: tile(<IconMail size={20} />),
      },
    ],
  },
];
