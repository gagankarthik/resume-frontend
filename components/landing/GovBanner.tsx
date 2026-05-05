'use client';
import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiLock } from 'react-icons/fi';

const GovBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-gov-navy w-full">
      {/* Top strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Flag */}
          <svg className="w-8 h-5 flex-shrink-0" viewBox="0 0 40 25">
            <rect width="40" height="25" fill="#B22234"/>
            {[0,1,2,3,4,5].map(i=>(
              <rect key={i} y={i*25/7*2+25/7} width="40" height={25/7} fill="#fff"/>
            ))}
            <rect width="16" height="13.5" fill="#3C3B6E"/>
            {[[4,2.5],[8,2.5],[12,2.5],[6,5],[10,5],[4,7.5],[8,7.5],[12,7.5],[6,10],[10,10]].map(([cx,cy],i)=>(
              <polygon key={i} fill="#fff"
                points={`${cx},${cy-1.1} ${cx+0.4},${cy+0.4} ${cx+1.1},${cy+0.4} ${cx+0.5},${cy+1} ${cx+0.7},${cy+1.8} ${cx},${cy+1.3} ${cx-0.7},${cy+1.8} ${cx-0.5},${cy+1} ${cx-1.1},${cy+0.4} ${cx-0.4},${cy+0.4}`}/>
            ))}
          </svg>
          <span className="text-white text-xs font-semibold tracking-wide">
            An official State Government document processing system
          </span>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1 text-blue-300 hover:text-white text-xs font-medium transition-colors"
        >
          Here&apos;s how you know
          {expanded ? <FiChevronUp size={13}/> : <FiChevronDown size={13}/>}
        </button>
      </div>

      {/* Expanded explanation */}
      {expanded && (
        <div className="border-t border-white/10 bg-gov-navy/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
            <div className="flex gap-3">
              <span className="text-2xl flex-shrink-0">🏛️</span>
              <div>
                <p className="text-white text-sm font-semibold mb-1">Official state system</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  This system is authorized for use in processing Ohio and Pennsylvania state job applications. All outputs conform to state HR formatting standards.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <FiLock className="text-gov-gold flex-shrink-0 mt-0.5" size={20}/>
              <div>
                <p className="text-white text-sm font-semibold mb-1">Secure & encrypted</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Data is transmitted over TLS and processed in-memory only. No resume content is retained after extraction. Compliant with state data privacy regulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovBanner;
