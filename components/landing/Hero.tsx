'use client';

import { motion } from 'framer-motion';
import OrbitingCircles, { type Orbit } from '@/components/ui/OrbitingCircles';
import { ArrowRight, ButtonLink } from '@/components/ui/Button';

/**
 * The rings carry the real payload: file types in on the inner orbits,
 * agency templates out on the widest one.
 */
const ORBITS: Orbit[] = [
  {
    size: 'h-[17rem] w-[17rem] md:h-[26rem] md:w-[26rem]',
    duration: 26,
    chips: [
      { label: '.pdf', angle: -52, tone: '#CE3A48' },
      { label: '.docx', angle: 52, tone: '#1F6FEB' },
    ],
  },
  {
    size: 'h-[23rem] w-[23rem] md:h-[34rem] md:w-[34rem]',
    duration: 34,
    chips: [
      { label: '.doc', angle: -30, tone: '#1F6FEB' },
      { label: '.txt', angle: 30, tone: '#5C6E88' },
      { label: 'OCR', angle: 84, tone: '#C97A06' },
    ],
  },
  {
    size: 'h-[29rem] w-[29rem] md:h-[42rem] md:w-[42rem]',
    duration: 44,
    chips: [
      { label: 'Ohio', angle: -62, tone: '#1F6FEB' },
      { label: 'Pennsylvania', angle: -21, tone: '#002868' },
      { label: 'Georgia', angle: 21, tone: '#BA0C2F' },
      { label: 'Oceanblue', angle: 62, tone: '#1F6FEB' },
    ],
  },
];

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-28 sm:pt-32">
      <div className="mx-auto max-w-[1140px] px-5">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h1
            {...rise(0)}
            className="text-[36px] font-semibold leading-[1.06] tracking-[-0.035em] text-tc-ink sm:text-[54px]"
          >
            Resumes, set to the format
            <br className="hidden sm:block" /> the state requires.
          </motion.h1>

          <motion.p
            {...rise(0.08)}
            className="mx-auto mt-6 max-w-xl text-[17px] leading-[1.6] text-tc-muted"
          >
            Upload a resume. Truecopy reads every section word for word, checks it against
            the original, and writes the agency&rsquo;s template.
          </motion.p>

          <motion.div {...rise(0.16)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/upload" size="lg">
              Upload a resume
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="#how" variant="secondary" size="lg">
              How it works
            </ButtonLink>
          </motion.div>
        </div>
      </div>

      {/* Orbiting rings — file types in, templates out */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="mt-14 sm:mt-16"
      >
        <OrbitingCircles orbits={ORBITS} className="h-[16rem] md:h-[23rem]" />
      </motion.div>
    </section>
  );
}
