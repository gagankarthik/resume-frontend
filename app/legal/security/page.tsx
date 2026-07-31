import { DocHeader, DocList, DocNote, DocSection } from '@/components/legal/Doc';

export const metadata = { title: 'Security' };

export default function Security() {
  return (
    <>
      <DocHeader title="Security" updated="31 July 2026" />

      <DocSection title="How a file is handled">
        <p>
          An uploaded resume is read into memory, parsed, and discarded when the request
          ends. It is never written to disk on our servers, and there is no bucket of past
          uploads to breach.
        </p>
      </DocSection>

      <DocSection title="Sign-in">
        <p>
          Authentication is Amazon Cognito using the authorization code flow with PKCE.
          The code exchange happens on the server; the identity token is stored in an
          httpOnly, SameSite cookie that page JavaScript cannot read, which keeps a
          cross-site scripting bug from turning into a stolen session.
        </p>
        <p>
          Every request that touches candidate data verifies that token&rsquo;s signature
          against the user pool&rsquo;s published keys, along with its issuer, audience,
          and expiry.
        </p>
      </DocSection>

      <DocSection title="The extraction service">
        <p>
          The browser never calls the extraction engine directly. Requests go through this
          application&rsquo;s own endpoint, which checks the session, validates the file
          type and size, and forwards the bytes. The engine&rsquo;s address and any key it
          needs stay server-side.
        </p>
      </DocSection>

      <DocSection title="In transit and at rest">
        <DocList
          items={[
            'TLS on every connection.',
            'No candidate data at rest on our infrastructure.',
            'The extracted record lives in your browser and can be cleared at any time.',
            'Secrets are held as deployment environment variables, never in the client bundle.',
          ]}
        />
      </DocSection>

      <DocSection title="Reporting a vulnerability">
        <p>
          Send details to{' '}
          <a
            href="mailto:oceanbluesolutions@gmail.com"
            className="text-tc-azure underline underline-offset-2"
          >
            oceanbluesolutions@gmail.com
          </a>
          . Please give us a reasonable window to fix an issue before disclosing it. We
          will not pursue action against good-faith research that avoids privacy
          violations and service degradation.
        </p>
      </DocSection>

      <DocNote>
        This page describes the controls in the current build. It is not a certification,
        and it does not claim SOC 2 or ISO 27001 attestation.
      </DocNote>
    </>
  );
}
