import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="blueprint-grid border-t-2 border-ink bg-ink-deep">
      {/* CTA band */}
      <div className="mx-auto max-w-[1180px] px-5 pb-16 pt-20 text-center">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-sky-300/60">
          The line is open
        </p>
        <h2 className="mx-auto max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.02em] text-paper sm:text-5xl">
          Put your next resume on the line.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-sky-100/55">
          Upload, review, export. A submission-ready document in minutes — no account, no cost.
        </p>
        <div className="mt-9">
          <Link
            href="/upload"
            className="lift-block hard-shadow-signal inline-block border-2 border-signal bg-signal px-8 py-4 text-[14px] font-extrabold uppercase tracking-wide text-white"
          >
            Start a conversion
          </Link>
        </div>
        <p className="mt-10 font-mono text-[10px] tracking-[0.16em] text-sky-200/40">
          PDF · DOCX · DOC · TXT&ensp;—&ensp;NO ACCOUNT REQUIRED&ensp;—&ensp;NOTHING RETAINED
        </p>
      </div>

      {/* Footer proper */}
      <div className="border-t border-sky-200/15">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-5 py-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center border-2 border-paper/70 bg-paper font-mono text-[10px] font-semibold text-ink">
                RK
              </span>
              <span className="text-sm font-black tracking-tight text-paper">RESUMEKIT</span>
            </div>
            <p className="mt-3 font-mono text-[10.5px] leading-relaxed tracking-[0.04em] text-sky-200/45">
              Document conversion for state workforce submissions. Extract, audit, edit, export.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-14 gap-y-2.5 font-mono text-[11px] tracking-[0.1em] text-sky-200/55">
            <a href="#pipeline" className="transition-colors hover:text-signal">THE LINE</a>
            <a href="#formats" className="transition-colors hover:text-signal">FORMATS</a>
            <a href="#capabilities" className="transition-colors hover:text-signal">CAPABILITIES</a>
            <Link href="/upload" className="transition-colors hover:text-signal">START A CONVERSION</Link>
          </nav>
        </div>

        <div className="border-t border-sky-200/10">
          <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-2 px-5 py-5 font-mono text-[10px] tracking-[0.14em] text-sky-200/35 sm:flex-row">
            <p>© {new Date().getFullYear()} OCEANBLUE SOLUTIONS</p>
            <p>DWG № RK-{new Date().getFullYear()}-01 · REV C</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
