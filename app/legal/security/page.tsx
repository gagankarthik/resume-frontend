import { DocHeader, DocList, DocNote, DocSection } from '@/components/legal/Doc';

export const metadata = { title: 'Security' };

export default function Security() {
  return (
    <>
      <DocHeader title="Security" updated="25 September 2026" />

      <DocSection title="How a file is handled">
        <p>
          An uploaded resume is read into memory, parsed, and discarded when the request
          ends. The file itself is never written to disk on our servers, and there is no
          bucket of past uploads to breach.
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
          An upload starts with this application: it checks the session and issues a
          signed ticket that expires after five minutes. The browser spends that ticket on
          one upload to the extraction engine, which rejects any request without a valid
          one. If that connection fails, the file goes through this application&rsquo;s own
          endpoint instead, which performs the same checks. No engine key is ever sent to
          the browser.
        </p>
      </DocSection>

      <DocSection title="Stored records">
        <p>
          The structured record from each extraction is kept in an Amazon DynamoDB table in
          US East (Ohio), encrypted at rest with AWS-managed keys and covered by
          point-in-time recovery. Only the extraction service can write to it, and only
          this application can read it, each through its own least-privilege role.
        </p>
        <p>
          The talent heat map reads those records but shows only employer, job title,
          skills, years of experience, and location. Names, email addresses, and phone
          numbers are never shown on the map or included in its exports.
        </p>
      </DocSection>

      <DocSection title="In transit and at rest">
        <DocList
          items={[
            'TLS on every connection.',
            'Extracted records at rest are encrypted; resume files are never stored.',
            'The copy of a record in your browser can be cleared at any time.',
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
