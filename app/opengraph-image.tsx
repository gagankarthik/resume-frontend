import { ImageResponse } from 'next/og';

export const alt = 'Blue-IQ Hire: every resume, set to the state’s format';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** The share card: the mark, the product name and the one-line promise. */
export default function OpengraphImage() {
  const bands = [0, 1, 2, 3];
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #0B1830 0%, #13244A 100%)',
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <svg width="72" height="72" viewBox="0 0 32 32">
            <defs>
              <clipPath id="c">
                <circle cx="16" cy="16" r="13" />
              </clipPath>
            </defs>
            <path d="M15 3.04a13 13 0 0 0 0 25.92Z" fill="#2A45D8" />
            <g clipPath="url(#c)" fill="#1AA3C8">
              {bands.map(b => (
                <rect key={b} x="17" y={3 + b * 6.875} width="13" height="5.375" />
              ))}
            </g>
          </svg>
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
            Blue-IQ<span style={{ marginLeft: 12, fontWeight: 500, opacity: 0.6 }}>Hire</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2.5, lineHeight: 1.05, maxWidth: 900 }}>
            Every resume, set to the state’s format.
          </div>
          <div style={{ marginTop: 28, fontSize: 30, opacity: 0.7 }}>
            Ohio · Pennsylvania · Georgia · Oceanblue
          </div>
        </div>
      </div>
    ),
    size,
  );
}
