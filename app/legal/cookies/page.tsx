import { DocHeader, DocSection } from '@/components/legal/Doc';

export const metadata = { title: 'Cookies' };

const COOKIES = [
  {
    name: 'tc_session',
    purpose: 'Holds your verified identity token so you stay signed in.',
    life: 'Until the token expires, typically one hour',
  },
  {
    name: 'tc_refresh',
    purpose: 'Lets your session be renewed without signing in again.',
    life: 'Up to 30 days',
  },
  {
    name: 'tc_pkce, tc_state, tc_next',
    purpose:
      'Short-lived values that tie a sign-in attempt to this browser and remember where you were heading.',
    life: '10 minutes',
  },
];

export default function Cookies() {
  return (
    <>
      <DocHeader title="Cookies" updated="31 July 2026" />

      <DocSection title="What we set">
        <p>
          Truecopy sets no advertising or analytics cookies. Every cookie below is
          strictly necessary for signing in, is httpOnly so page scripts cannot read it,
          and is marked Secure and SameSite in production.
        </p>
      </DocSection>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="border-b border-tc-line">
              {['Cookie', 'Purpose', 'Lifetime'].map(h => (
                <th
                  key={h}
                  className="pb-3 pr-6 text-[12px] font-semibold uppercase tracking-[0.08em] text-tc-faint"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COOKIES.map(c => (
              <tr key={c.name} className="border-b border-tc-line last:border-0">
                <td className="py-4 pr-6 align-top font-mono text-[12.5px] text-tc-ink">
                  {c.name}
                </td>
                <td className="py-4 pr-6 align-top text-[14px] leading-[1.6] text-tc-muted">
                  {c.purpose}
                </td>
                <td className="py-4 align-top text-[14px] text-tc-muted">{c.life}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DocSection title="Local storage">
        <p>
          The extracted resume record is kept in your browser&rsquo;s local storage, not
          in a cookie, so it is never sent with a request. Clearing site data removes it.
        </p>
      </DocSection>

      <DocSection title="Your choices">
        <p>
          Because none of these are used for tracking, there is no consent banner to
          dismiss. Blocking them in your browser will prevent sign-in from working.
        </p>
      </DocSection>
    </>
  );
}
