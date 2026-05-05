import GovNav from '@/components/landing/GovNav';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import StateFormats from '@/components/landing/StateFormats';
import Features from '@/components/landing/Features';
import Link from 'next/link';
import { FiUploadCloud, FiFileText } from 'react-icons/fi';

export default function Home() {
  return (
    <main>
      <GovNav />
      <Hero />
      <HowItWorks />
      <StateFormats />
      <Features />

      {/* Final CTA */}
      <section className="py-24 bg-gov-navy relative overflow-hidden">
        <div className="absolute inset-0 gov-dot-grid pointer-events-none opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-gov-blue/40 to-transparent" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gov-blue/10 border border-gov-blue/25 rounded-full text-gov-blue text-xs font-bold tracking-wide mb-7">
            <FiFileText size={11} />
            Ready to get started
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Process your first resume<br className="hidden sm:block" /> in under 30 seconds
          </h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto mb-10 leading-relaxed">
            Upload any resume format. AI extracts everything. Edit, review, and download
            in your chosen state format — no signup, no cost.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/upload"
              className="flex items-center gap-2.5 px-8 py-4 bg-gov-blue hover:bg-gov-blue-mid text-white font-bold text-base rounded-xl transition-all shadow-xl shadow-blue-900/40 hover:shadow-blue-900/60 hover:-translate-y-0.5"
            >
              <FiUploadCloud size={18} />
              Upload Resume
            </Link>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-gov-green" />
              No account required
            </div>
          </div>

          <div className="mt-14 pt-8 border-t border-white/8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
            <span>PDF · DOCX · DOC · TXT</span>
            <span className="w-px h-4 bg-white/10" />
            <span>Multiple state formats</span>
            <span className="w-px h-4 bg-white/10" />
            <span>Local storage only — no retention</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/90 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
            <div className="max-w-xs">
              <p className="text-white font-bold text-sm mb-2">ResumeKit</p>
              <p className="text-slate-500 text-xs leading-relaxed">
                AI-powered resume extraction and formatting for state job applications. Upload, edit, and download in seconds.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-xs text-slate-500">
              <a href="/#how-it-works" className="hover:text-slate-300 transition-colors">How It Works</a>
              <a href="/#formats" className="hover:text-slate-300 transition-colors">Formats</a>
              <a href="/#features" className="hover:text-slate-300 transition-colors">Features</a>
              <Link href="/upload" className="hover:text-slate-300 transition-colors">Upload Resume</Link>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-700">
            <p>© {new Date().getFullYear()} ResumeKit · Powered by AI</p>
            <p>State Format Tool</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
