'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { RADAR_CANDIDATES } from '@/lib/site/content';

/**
 * Matching, drawn as distance: the job at the centre, each resume placed as
 * far out as its score is short of 100. Rings mark the bands the product
 * reports (strong, possible, weak). Candidates drift in from the edge once,
 * when the drawing comes into view.
 */


const C = 230;
const radius = (score: number) => 34 + (100 - score) * 3.5;
const band = (score: number) =>
  score >= 80
    ? { fill: '#0B8F68', ring: '#DBF3EA' }
    : score >= 65
      ? { fill: '#B86E00', ring: '#FCF1DC' }
      : { fill: '#8C99AE', ring: '#E6ECF5' };

export default function FitRadar() {
  const still = useReducedMotion();
  const FONT = 'var(--font-public), system-ui, sans-serif';

  return (
    <svg
      viewBox="0 0 460 460"
      className="mx-auto block h-auto w-full max-w-[520px]"
      role="img"
      aria-label="A job at the centre with seven candidates placed around it. The closer a candidate sits, the higher their fit score."
    >
      {/* bands */}
      {[
        { r: radius(80), label: '80+ strong fit', fill: '#F3FBF7' },
        { r: radius(65), label: '65–79 possible fit', fill: '#FFFBF3' },
        { r: 214, label: 'Below 65', fill: '#F7F9FC' },
      ]
        .reverse()
        .map(b => (
          <g key={b.label}>
            <circle cx={C} cy={C} r={b.r} fill={b.fill} stroke="#DFE5EE" />
            <text x={C} y={C - b.r + 16} textAnchor="middle" fontFamily={FONT} fontSize="11" fill="#8C99AE">
              {b.label}
            </text>
          </g>
        ))}

      {/* spokes to the strong fits */}
      {RADAR_CANDIDATES.filter(c => c.score >= 80).map(c => {
        const a = (c.angle * Math.PI) / 180;
        const r = radius(c.score);
        return (
          <motion.line
            key={c.initials}
            x1={C} y1={C} x2={(C + Math.cos(a) * r).toFixed(1)} y2={(C + Math.sin(a) * r).toFixed(1)}
            stroke="#0B8F68" strokeWidth="1.3" strokeDasharray="3 4"
            initial={still ? false : { opacity: 0 }}
            whileInView={{ opacity: 0.7 }}
            viewport={{ once: true }}
            transition={{ delay: 1.1, duration: 0.5 }}
          />
        );
      })}

      {/* the job */}
      <circle cx={C} cy={C} r="30" fill="#2A45D8" />
      <g transform={`translate(${C - 11} ${C - 10})`} fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="0" y="5" width="22" height="15" rx="3" />
        <path d="M7 5V3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M0 11h22" />
      </g>

      {/* candidates */}
      {RADAR_CANDIDATES.map((c, i) => {
        const a = (c.angle * Math.PI) / 180;
        const r = radius(c.score);
        const x = C + Math.cos(a) * r;
        const y = C + Math.sin(a) * r;
        const drift = 240 - r;
        const tone = band(c.score);
        return (
          <motion.g
            key={c.initials}
            initial={still ? false : { opacity: 0, x: Math.cos(a) * drift, y: Math.sin(a) * drift }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r="21" fill={tone.ring} />
            <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r="16" fill="#fff" stroke={tone.fill} strokeWidth="2" />
            <text x={x.toFixed(1)} y={(y + 4).toFixed(1)} textAnchor="middle" fontFamily={FONT} fontSize="11" fontWeight="700" fill="#0C1B33">
              {c.initials}
            </text>
            <text x={x.toFixed(1)} y={(y + 33).toFixed(1)} textAnchor="middle" fontFamily={FONT} fontSize="11" fontWeight="600" fill={tone.fill}>
              {c.score}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}
