import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MarketingPage from '@/components/landing/MarketingPage';
import PageHero from '@/components/landing/PageHero';
import SectionHeading from '@/components/landing/SectionHeading';
import TemplateCards from '@/components/landing/TemplateCards';
import { EMBLEM_COLOR, EmblemGlyph } from '@/components/landing/illustrations/Emblems';
import { ButtonLink } from '@/components/ui/Button';
import { TEMPLATE_PAGES, templateBySlug } from '@/lib/site/content';

export const dynamicParams = false;

export function generateStaticParams() {
  return TEMPLATE_PAGES.map(t => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = templateBySlug(slug);
  if (!t) return {};
  return {
    title: `${t.name} resume template (${t.submittedThrough})`,
    description: `${t.intro} Export any resume to the ${t.name} format as a Word document with Blue-IQ Hire.`,
    alternates: { canonical: `/templates/${t.slug}` },
  };
}

/* The emblem at hero size, on its disc with two quiet rings around it. */
function EmblemArt({ id }: { id: Parameters<typeof EmblemGlyph>[0]['id'] }) {
  const c = EMBLEM_COLOR[id];
  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-[340px] place-items-center" aria-hidden>
      <span className="absolute inset-0 rounded-full border border-tc-line" />
      <span className="absolute inset-[12%] rounded-full border border-dashed border-tc-line-2" />
      <span className="grid h-[62%] w-[62%] place-items-center rounded-full shadow-[0_30px_60px_-24px_rgba(12,27,51,0.35)]" style={{ background: c.tint }}>
        <EmblemGlyph id={id} size={150} />
      </span>
    </div>
  );
}

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = templateBySlug(slug);
  if (!t) notFound();

  const specs = [
    { label: 'Submitted through', value: t.submittedThrough },
    { label: 'Best for', value: t.bestFor },
    { label: 'Masthead', value: t.masthead },
    { label: 'File', value: 'Word document (.docx)' },
  ];

  return (
    <MarketingPage
      trail={[
        { name: 'Home', path: '/' },
        { name: 'Templates', path: '/templates' },
        { name: t.name, path: `/templates/${t.slug}` },
      ]}
    >
      <PageHero
        crumbs={[
          { href: '/', label: 'Home' },
          { href: '/templates', label: 'Templates' },
          { href: `/templates/${t.slug}`, label: t.name },
        ]}
        title={`The ${t.name} template`}
        lede={t.intro}
        actions={
          <ButtonLink href="/talent" size="lg">
            Get started
          </ButtonLink>
        }
        art={<EmblemArt id={t.id} />}
      />

      {/* Specification + order */}
      <section className="bg-white py-24 lg:py-28">
        <div className="mx-auto grid max-w-[1200px] gap-14 px-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <SectionHeading title="Specification" />
            <dl className="mt-8 divide-y divide-tc-line border-y border-tc-line">
              {specs.map(s => (
                <div key={s.label} className="grid gap-1 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6">
                  <dt className="text-[14.5px] text-tc-muted">{s.label}</dt>
                  <dd className="text-[15px] font-medium text-tc-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <SectionHeading title="Section order" />
            <ol className="relative mt-8">
              <span className="absolute bottom-4 left-[15px] top-4 w-px bg-tc-line" aria-hidden />
              {t.order.map((s, i) => (
                <li key={s} className="relative flex items-center gap-4 py-2.5">
                  <span
                    className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border bg-white text-[13px] font-semibold tabular-nums"
                    style={{ borderColor: `${EMBLEM_COLOR[t.id].main}55`, color: EMBLEM_COLOR[t.id].main }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[15.5px] text-tc-ink">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="border-y border-tc-line bg-tc-desk py-24 lg:py-28">
        <div className="mx-auto max-w-[1200px] px-5">
          <SectionHeading title={`What sets ${t.name} apart`} />
          <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {t.details.map(d => (
              <li key={d.title} className="border-t-2 pt-6" style={{ borderColor: EMBLEM_COLOR[t.id].main }}>
                <h3 className="text-[18px] font-semibold text-tc-ink">{d.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-tc-muted">{d.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-[1200px] px-5">
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-tc-ink">The other templates</h2>
          <div className="mt-6">
            <TemplateCards exclude={t.slug} />
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
