import { HireMark } from '@/components/brand/Logo';

/**
 * Skills, in orbit around the record they are read from. Three rings turn at
 * different speeds (the middle one the other way); every chip turns back as
 * its ring turns, so the text stays level. Pure CSS — see globals.css.
 */

type Ring = { size: number; speed: string; reverse?: boolean; skills: string[] };

const RINGS: Ring[] = [
  { size: 240, speed: '50s', skills: ['Java', 'Python', 'SQL'] },
  { size: 400, speed: '70s', reverse: true, skills: ['AWS', 'Snowflake', 'React', 'Azure', 'Kafka'] },
  { size: 560, speed: '95s', skills: ['Salesforce', 'Kubernetes', 'Power BI', 'Workday', 'Spring Boot', 'Epic', 'Terraform'] },
];

const TONES = [
  'border-indigo-200 bg-indigo-50 text-indigo-700',
  'border-pink-200 bg-pink-50 text-pink-700',
  'border-cyan-200 bg-cyan-50 text-cyan-700',
  'border-violet-200 bg-violet-50 text-violet-700',
  'border-emerald-200 bg-emerald-50 text-emerald-700',
  'border-amber-200 bg-amber-50 text-amber-700',
];

export function Orbit() {
  const box = RINGS[RINGS.length - 1].size + 40;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[600px] [container-type:inline-size]" aria-hidden>
      <div className="absolute inset-0 grid place-items-center">
        {RINGS.map((ring, ri) => (
          <div
            key={ring.size}
            className={`orbit-ring absolute rounded-full border border-dashed border-zinc-200 ${ring.reverse ? 'orbit-reverse' : ''}`}
            style={{
              width: `${(ring.size / box) * 100}%`,
              height: `${(ring.size / box) * 100}%`,
              ['--orbit-speed' as string]: ring.speed,
            }}
          >
            {ring.skills.map((skill, i) => {
              const angle = (360 / ring.skills.length) * i + ri * 20;
              return (
                <div
                  key={skill}
                  className="absolute left-1/2 top-1/2"
                  style={{ transform: `rotate(${angle}deg) translateX(${(ring.size / box) * 50}cqw) rotate(${-angle}deg)` }}
                >
                  <div className="-translate-x-1/2 -translate-y-1/2">
                    <span
                      className={`orbit-chip inline-block whitespace-nowrap rounded-full border px-3 py-1 text-[12.5px] font-medium shadow-[0_6px_14px_-10px_rgba(9,9,11,0.4)] ${TONES[(ri * 3 + i) % TONES.length]}`}
                      style={{ ['--orbit-speed' as string]: ring.speed }}
                    >
                      {skill}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div className="relative grid h-24 w-24 place-items-center rounded-3xl border border-zinc-200 bg-white shadow-[0_20px_40px_-20px_rgba(79,70,229,0.5)]">
          <HireMark size={52} />
        </div>
      </div>
    </div>
  );
}

export default function SkillOrbit() {
  const facts = [
    ['Titles', 'mapped to standard families'],
    ['Employers', 'spellings joined into one'],
    ['Skills', 'in one spelling, never dropped'],
  ];
  return (
    <section className="overflow-hidden border-y border-zinc-100 bg-zinc-50/60 py-24">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-indigo-600">Normalization</p>
          <h2 className="fade-text-light mt-4 text-balance text-[34px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[50px]">
            Every skill, understood the same way.
          </h2>
          <p className="mt-5 max-w-[30rem] text-[17px] leading-[1.6] text-zinc-500">
            “k8s”, “Kubernetes” and “K8S cluster admin” count as one skill. That is what makes a search for
            Kubernetes engineers return all of them.
          </p>
          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            {facts.map(([t, s]) => (
              <div key={t} className="rounded-xl border border-zinc-200 bg-white p-4">
                <dt className="text-[15px] font-semibold text-zinc-900">{t}</dt>
                <dd className="mt-1 text-[13px] leading-[1.45] text-zinc-500">{s}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Orbit />
      </div>
    </section>
  );
}
