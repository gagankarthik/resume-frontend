import React from 'react';
import Link from 'next/link';
import { FiUpload, FiFileText } from 'react-icons/fi';

const GovNav: React.FC = () => (
  <nav className="bg-gov-navy/95 backdrop-blur-sm border-b border-white/8 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 rounded-lg bg-gov-blue flex items-center justify-center shadow-md shadow-blue-900/40">
          <FiFileText size={15} color="white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight tracking-tight group-hover:text-blue-200 transition-colors">
            ResumeKit
          </p>
          <p className="text-blue-400/60 text-[9px] tracking-widest uppercase font-medium">State Format Tool</p>
        </div>
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-1">
        <NavLink href="/#how-it-works">How It Works</NavLink>
        <NavLink href="/#formats">Formats</NavLink>
        <NavLink href="/#features">Features</NavLink>
      </div>

      {/* CTA */}
      <Link
        href="/upload"
        className="flex items-center gap-1.5 px-4 py-2 bg-gov-blue hover:bg-gov-blue-mid text-white rounded-lg font-semibold text-sm transition-all shadow-md shadow-blue-900/30 hover:shadow-blue-900/50"
      >
        <FiUpload size={13} />
        Upload Resume
      </Link>
    </div>
  </nav>
);

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="px-3 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors rounded-lg hover:bg-white/5"
  >
    {children}
  </a>
);

// Kept for backward compatibility with editor/page.tsx
export const OfficialSeal = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="57" stroke="#005ea2" strokeWidth="2.5"/>
    <circle cx="60" cy="60" r="50" stroke="#005ea2" strokeWidth="0.8" strokeDasharray="3 2.5"/>
    <circle cx="60" cy="60" r="46" fill="#0d2240"/>
    <path d="M60 22 L82 34 L82 62 C82 78 60 92 60 92 C60 92 38 78 38 62 L38 34 Z" fill="#005ea2" opacity="0.25" stroke="#005ea2" strokeWidth="1.5" strokeLinejoin="round"/>
    <clipPath id="shield-clip">
      <path d="M60 22 L82 34 L82 62 C82 78 60 92 60 92 C60 92 38 78 38 62 L38 34 Z"/>
    </clipPath>
    {[44,52,60,68].map((y, i) => (
      <line key={i} x1="38" y1={y} x2="82" y2={y} stroke="#005ea2" strokeWidth="0.8" opacity="0.4" clipPath="url(#shield-clip)"/>
    ))}
    {Array.from({length: 13}, (_, i) => {
      const angle = (i * 360/13 - 90) * Math.PI / 180;
      const r = 53.5;
      return <circle key={i} cx={60 + r * Math.cos(angle)} cy={60 + r * Math.sin(angle)} r="2" fill="#b88400"/>;
    })}
    <text textAnchor="middle" fontSize="6.5" fontWeight="700" letterSpacing="2.5" fill="#b88400" fontFamily="'Public Sans', sans-serif">
      <textPath href="#top-arc" startOffset="50%">STATE FORMAT TOOL</textPath>
    </text>
    <path id="top-arc" d="M 16 60 A 44 44 0 0 1 104 60" fill="none"/>
    <text x="60" y="58" textAnchor="middle" fontSize="9" fontWeight="800" fill="white" fontFamily="'Public Sans', sans-serif" letterSpacing="0.5">RK</text>
    <text x="60" y="70" textAnchor="middle" fontSize="5.5" fontWeight="600" fill="#8ba8c8" fontFamily="'Public Sans', sans-serif" letterSpacing="1">RESUME</text>
    <text x="60" y="79" textAnchor="middle" fontSize="4.5" fontWeight="600" fill="#8ba8c8" fontFamily="'Public Sans', sans-serif" letterSpacing="0.5">KIT</text>
  </svg>
);

export default GovNav;
