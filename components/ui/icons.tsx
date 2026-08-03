import type { SVGProps } from 'react';

/**
 * Hire icon set.
 *
 * Drawn on one 20×20 grid with a 1.5 stroke, round caps and joins, and a
 * shared 2.5-unit corner radius on every sheet. Everything in the product is
 * a page, so the page silhouette is the unit the set is built from — the same
 * rectangle appears in upload, review, export, split view, and the mark.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 18, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* The page — every other icon is built from this rectangle. */
const PAGE = <rect x="4" y="2.5" width="12" height="15" rx="2.5" />;

export const IconPage = (p: IconProps) => <Icon {...p}>{PAGE}</Icon>;

export const IconUpload = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 12.5V3.5m0 0L7 6.5M10 3.5l3 3" />
    <path d="M3.5 12v3A1.5 1.5 0 0 0 5 16.5h10a1.5 1.5 0 0 0 1.5-1.5v-3" />
  </Icon>
);

export const IconDownload = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 3.5v9m0 0-3-3m3 3 3-3" />
    <path d="M3.5 12v3A1.5 1.5 0 0 0 5 16.5h10a1.5 1.5 0 0 0 1.5-1.5v-3" />
  </Icon>
);

/* A page being read — lines lifting off the sheet. */
export const IconRead = (p: IconProps) => (
  <Icon {...p}>
    {PAGE}
    <path d="M7 6.5h6M7 10h6M7 13.5h3.5" />
  </Icon>
);

/* A page checked against the source. */
export const IconVerified = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16 9V5a2.5 2.5 0 0 0-2.5-2.5h-7A2.5 2.5 0 0 0 4 5v10a2.5 2.5 0 0 0 2.5 2.5H9" />
    <path d="M7 6.5h6M7 10h4" />
    <circle cx="14" cy="14" r="3.5" />
    <path d="m12.7 14 .9.9 1.8-1.9" />
  </Icon>
);

/* A page with something to look at. */
export const IconFlag = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16 9V5a2.5 2.5 0 0 0-2.5-2.5h-7A2.5 2.5 0 0 0 4 5v10a2.5 2.5 0 0 0 2.5 2.5H9" />
    <path d="M7 6.5h6M7 10h4" />
    <circle cx="14" cy="14" r="3.5" />
    <path d="M14 12.6v1.6M14 15.7h.01" />
  </Icon>
);

export const IconEdit = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16 9.5V5a2.5 2.5 0 0 0-2.5-2.5h-7A2.5 2.5 0 0 0 4 5v10a2.5 2.5 0 0 0 2.5 2.5H10" />
    <path d="M7 6.5h5M7 9.5h3" />
    <path d="m17 11.5-4.2 4.2-2 .6.6-2L15.6 10a1 1 0 0 1 1.4 1.5Z" />
  </Icon>
);

/* Two pages side by side. */
export const IconSplit = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2.5" y="3.5" width="6.5" height="13" rx="2" />
    <rect x="11" y="3.5" width="6.5" height="13" rx="2" />
  </Icon>
);

export const IconPreview = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 10s2.8-4.5 7.5-4.5S17.5 10 17.5 10s-2.8 4.5-7.5 4.5S2.5 10 2.5 10Z" />
    <circle cx="10" cy="10" r="2" />
  </Icon>
);

export const IconPrint = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 7.5V3.5h8v4" />
    <path d="M6 14H4.5A1.5 1.5 0 0 1 3 12.5v-3A1.5 1.5 0 0 1 4.5 8h11A1.5 1.5 0 0 1 17 9.5v3a1.5 1.5 0 0 1-1.5 1.5H14" />
    <rect x="6" y="11.5" width="8" height="5" rx="1.5" />
  </Icon>
);

export const IconCheck = (p: IconProps) => (
  <Icon {...p}>
    <path d="m4.5 10.5 3.5 3.5 7.5-8" />
  </Icon>
);

export const IconCheckCircle = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="7.5" />
    <path d="m6.8 10.2 2.2 2.2 4.2-4.6" />
  </Icon>
);

export const IconAlert = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="7.5" />
    <path d="M10 6.5v4M10 13.5h.01" />
  </Icon>
);

export const IconSave = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 5a2.5 2.5 0 0 1 2.5-2.5h6L17 7v8a2.5 2.5 0 0 1-2.5 2.5h-8A2.5 2.5 0 0 1 4 15V5Z" />
    <path d="M7 2.5v4h5M7 13h6" />
  </Icon>
);

export const IconArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 10h13m-4.5-4.5L16.5 10 12 14.5" />
  </Icon>
);

export const IconArrowLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16.5 10h-13m4.5 4.5L3.5 10 8 5.5" />
  </Icon>
);

export const IconChevronDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5.5 8 4.5 4.5L14.5 8" />
  </Icon>
);

export const IconClose = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5 5 10 10M15 5 5 15" />
  </Icon>
);

export const IconPlus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 4.5v11M4.5 10h11" />
  </Icon>
);

/* A page brought to a mark — the record measured against a job. */
export const IconMatch = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2.5" y="3" width="9" height="11" rx="2.5" />
    <path d="M5.5 6.5h3M5.5 9.5h3" />
    <circle cx="15" cy="14.5" r="3.5" />
    <path d="M13.6 14.5l1 1 1.8-2" />
  </Icon>
);

export const IconTrash = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 5.5h13M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5" />
    <path d="M5.5 5.5 6 16a1.5 1.5 0 0 0 1.5 1.4h5A1.5 1.5 0 0 0 14 16l.5-10.5" />
  </Icon>
);
