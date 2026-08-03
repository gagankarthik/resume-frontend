import Link from 'next/link';
import { HireLogo } from '@/components/brand/Logo';

const PAGES = [
  { href: '/legal/privacy', label: 'Privacy policy' },
  { href: '/legal/terms', label: 'Terms of service' },
  { href: '/legal/data-processing', label: 'Data processing' },
  { href: '/legal/security', label: 'Security' },
  { href: '/legal/cookies', label: 'Cookies' },
  { href: '/legal/accessibility', label: 'Accessibility' },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-tc-line">
        <div className="mx-auto flex h-16 max-w-[1140px] items-center justify-between px-5">
          <HireLogo />
          <Link
            href="/"
            className="text-[13.5px] font-medium text-tc-muted transition-colors hover:text-tc-ink"
          >
            Back to home
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1140px] flex-1 gap-12 px-5 py-14 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Legal documents" className="lg:sticky lg:top-14 lg:h-fit">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-tc-faint">
            Legal
          </h2>
          <ul className="mt-4 space-y-1">
            {PAGES.map(p => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="block rounded-lg px-3 py-2 text-[13.5px] text-tc-muted transition-colors hover:bg-tc-desk hover:text-tc-ink"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <article className="max-w-[68ch]">{children}</article>
      </div>

      <footer className="border-t border-tc-line">
        <div className="mx-auto flex max-w-[1140px] items-center justify-between px-5 py-6 text-[12.5px] text-tc-faint">
          <span>© {new Date().getFullYear()} Oceanblue Solutions</span>
          <a href="mailto:oceanbluesolutions@gmail.com" className="transition-colors hover:text-tc-ink">
            oceanbluesolutions@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}
