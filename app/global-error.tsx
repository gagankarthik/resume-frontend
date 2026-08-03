'use client';

/**
 * Last resort — this replaces the root layout, so it ships its own <html> and
 * cannot rely on the app's fonts or stylesheet being present.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#fff',
          color: '#0B1B33',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em', margin: 0 }}>
            Hire could not load
          </h1>
          <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.6, color: '#5C6E88' }}>
            Reload the page. If it keeps happening, the app may be mid-deploy.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 24,
              height: 44,
              padding: '0 22px',
              borderRadius: 10,
              border: 'none',
              background: '#0B1B33',
              color: '#fff',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
          {error.digest && (
            <p style={{ marginTop: 28, fontSize: 11, color: '#8FA0B8', fontFamily: 'monospace' }}>
              Reference {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
