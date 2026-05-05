'use client';
import React from 'react';
import Link from 'next/link';
import { FiUploadCloud, FiArrowRight } from 'react-icons/fi';

// ── Floating product mockup ────────────────────────────────────────────────

const ProductMockup: React.FC = () => (
  <div className="relative select-none">
    {/* Browser window chrome */}
    <div className="relative bg-[#111827] rounded-2xl shadow-2xl shadow-black/60 border border-white/10 overflow-hidden">
      {/* Tab bar */}
      <div className="bg-[#0d1117] px-4 py-2.5 flex items-center gap-3 border-b border-white/8">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        </div>
        <div className="flex-1 bg-white/5 rounded-md px-3 py-1 text-[10px] text-white/30 text-center">
          resumekit.app/editor
        </div>
      </div>

      {/* Split editor content */}
      <div className="flex h-72">
        {/* Left: field editor */}
        <div className="w-1/2 border-r border-white/8 p-3 overflow-hidden">
          <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-2.5">Field Editor</p>
          {[
            { label: 'Full Name', value: 'Sarah Mitchell' },
            { label: 'Job Title', value: 'Sr. Software Engineer' },
            { label: 'Location', value: 'Columbus, OH' },
          ].map(f => (
            <div key={f.label} className="mb-2">
              <p className="text-[7px] text-white/30 uppercase tracking-wide mb-0.5">{f.label}</p>
              <div className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[9px] text-white/70">{f.value}</div>
            </div>
          ))}
          <p className="text-[7px] text-white/30 uppercase tracking-wide mt-2 mb-1">Skills</p>
          <div className="flex flex-wrap gap-1">
            {['Python', 'React', 'AWS', 'Docker', 'SQL'].map(s => (
              <span key={s} className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[7px] font-semibold">{s}</span>
            ))}
          </div>
          <p className="text-[7px] text-white/30 uppercase tracking-wide mt-2.5 mb-1">Work Experience</p>
          <div className="space-y-1">
            {[
              { c: 'Google LLC', r: 'Staff Engineer', p: 'Jan 2021 – Present' },
              { c: 'Meta Platforms', r: 'Software Engineer', p: 'Mar 2018 – Dec 2020' },
            ].map(j => (
              <div key={j.c} className="bg-white/4 border border-white/8 rounded px-2 py-1.5">
                <p className="text-[8px] font-bold text-white/80">{j.c}</p>
                <p className="text-[7px] text-white/40">{j.r} · {j.p}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: live preview */}
        <div className="w-1/2 p-3 bg-white/2">
          <p className="text-[8px] font-black text-amber-400/80 uppercase tracking-widest mb-2.5">Live Preview</p>
          <div className="bg-white rounded-lg p-2.5 shadow-sm">
            <p className="text-[10px] font-bold text-[#1F497D] text-center">Sarah Mitchell</p>
            <p className="text-[7px] text-gray-400 text-center mb-1.5">Sr. Software Engineer · Columbus, OH</p>
            <div className="border-t border-gray-100 pt-1.5 space-y-1">
              <p className="text-[7px] font-black text-[#1F497D] uppercase tracking-wide">Employment History</p>
              <div>
                <p className="text-[7px] font-bold text-gray-700">Google LLC <span className="font-normal text-gray-400">Jan 2021 – Present</span></p>
                <p className="text-[7px] text-gray-500 ml-1">• Led migration to microservices — 40% latency reduction</p>
                <p className="text-[7px] text-gray-500 ml-1">• Managed team of 8 across 3 cross-functional products</p>
                <p className="text-[7px] text-gray-500 ml-1">• Implemented CI/CD pipeline reducing deploy time by 60%</p>
              </div>
              <p className="text-[7px] font-black text-[#1F497D] uppercase tracking-wide mt-1">Education</p>
              <p className="text-[7px] text-gray-600">M.S. Computer Science · Ohio State · 2018</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom status strip */}
      <div className="px-3 py-1.5 bg-gov-navy/80 flex items-center gap-3 text-[8px] text-slate-500">
        <span>Model: <span className="text-slate-400 font-mono">AI</span></span>
        <span>Fields: <span className="text-slate-400">47 extracted</span></span>
        <span>Format: <span className="text-slate-400">Ohio</span></span>
        <span className="ml-auto text-green-400/80">● Saved</span>
      </div>
    </div>

    {/* Floating badges */}
    <div className="absolute -top-3 -right-3 bg-gov-blue text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-blue-900/50 border border-blue-400/20">
      ✦ AI Extracted
    </div>
    <div className="absolute -bottom-3 left-4 bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-[10px] font-semibold px-3 py-1.5 rounded-full">
      Ohio &amp; PA formats
    </div>
  </div>
);

// ── Feature chips ──────────────────────────────────────────────────────────

const chips = [
  { icon: '📄', label: 'PDF · DOCX · TXT' },
  { icon: '⚡', label: 'Under 30 seconds' },
  { icon: '✏️', label: 'Inline editing' },
  { icon: '📥', label: 'DOCX export' },
];

// ── Hero ───────────────────────────────────────────────────────────────────

const Hero: React.FC = () => (
  <section className="relative overflow-hidden bg-gov-navy min-h-screen flex flex-col">
    {/* Background effects */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gov-blue/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl" />
      <div className="gov-dot-grid absolute inset-0 opacity-40" />
    </div>

    {/* Top accent */}
    <div className="w-full h-px bg-gradient-to-r from-transparent via-gov-blue/60 to-transparent flex-shrink-0" />

    {/* Content */}
    <div className="relative flex-1 flex items-center">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: Copy ──────────────────────────────────────────── */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gov-blue/10 border border-gov-blue/30 rounded-full text-gov-blue text-xs font-bold tracking-wide mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-gov-blue animate-pulse" />
              AI-Powered Resume Extraction
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white leading-[1.06] tracking-tight mb-6">
              Extract, Edit &amp;<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
                Format Resumes
              </span>
              <br />
              <span className="text-3xl sm:text-4xl xl:text-5xl text-white/70 font-bold">in seconds</span>
            </h1>

            {/* Sub */}
            <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-lg font-light">
              Upload any resume — our AI pulls every field instantly.
              Review, edit inline, and download formatted for{' '}
              <strong className="text-white font-semibold">Ohio</strong> or{' '}
              <strong className="text-white font-semibold">Pennsylvania</strong> state submissions.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/upload"
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gov-blue hover:bg-gov-blue-mid text-white font-bold text-base rounded-xl transition-all shadow-xl shadow-blue-900/40 hover:shadow-blue-900/60 hover:-translate-y-0.5"
              >
                <FiUploadCloud size={18} />
                Upload Resume
                <FiArrowRight size={15} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/15 hover:border-white/30 text-slate-300 hover:text-white text-base font-semibold rounded-xl transition-all hover:bg-white/5"
              >
                How It Works
              </a>
            </div>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2">
              {chips.map(c => (
                <span
                  key={c.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 text-xs font-medium"
                >
                  <span>{c.icon}</span>
                  {c.label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: Product mockup ────────────────────────────────── */}
          <div className="hidden lg:block">
            <ProductMockup />
          </div>
        </div>
      </div>
    </div>

    {/* Stats bar */}
    <div className="relative border-t border-white/8 bg-black/25 backdrop-blur-sm flex-shrink-0">
      <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-white/8">
        {[
          { value: '20+', label: 'Data Fields', sub: 'extracted per resume' },
          { value: '4',   label: 'File Formats', sub: 'PDF · DOCX · DOC · TXT' },
          { value: '2+',  label: 'State Formats', sub: 'and growing' },
          { value: '< 30s', label: 'Processing Time', sub: 'average extraction' },
        ].map(({ value, label, sub }) => (
          <div key={label} className="flex flex-col items-center text-center px-4 first:pl-0">
            <p className="text-2xl font-extrabold text-white mb-0.5 tabular-nums">{value}</p>
            <p className="text-xs font-semibold text-slate-300 leading-tight">{label}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Hero;
