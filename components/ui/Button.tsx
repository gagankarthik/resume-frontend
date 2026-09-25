import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'inverse';
type Size = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-tc-azure text-white hover:bg-tc-azure-d active:bg-tc-azure-d disabled:bg-tc-faint ' +
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_2px_rgba(10,30,58,0.2)]',
  secondary:
    'bg-white text-tc-ink border border-tc-line-2 hover:border-tc-faint hover:bg-tc-desk shadow-[0_1px_2px_rgba(10,30,58,0.05)]',
  ghost: 'text-tc-muted hover:text-tc-ink hover:bg-tc-desk',
  danger: 'bg-tc-rose text-white hover:brightness-95',
  inverse: 'bg-white text-tc-ink hover:bg-tc-desk-2',
};

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13.5px] rounded-md gap-1.5',
  md: 'h-10 px-4 text-[14px] rounded-md gap-2',
  lg: 'h-12 px-6 text-[15px] rounded-lg gap-2',
};

const base =
  'inline-flex items-center justify-center font-medium transition-all duration-150 ' +
  'disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px whitespace-nowrap';

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = '') {
  return `${base} ${VARIANT[variant]} ${SIZE[size]} ${extra}`;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: { variant?: Variant; size?: Size; children: ReactNode } & ComponentProps<'button'>) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, 'href' | 'className'>) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

export function ArrowRight({ className = '' }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
