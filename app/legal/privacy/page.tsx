import { DocHeader, DocList, DocNote, DocSection } from '@/components/legal/Doc';

export const metadata = { title: 'Privacy policy' };

export default function Privacy() {
  return (
    <>
      <DocHeader title="Privacy policy" updated="31 July 2026" />

      <DocSection title="What this covers">
        <p>
          Truecopy is operated by Oceanblue Solutions. This policy describes what happens
          to a resume you upload, what we keep, and what we do not.
        </p>
      </DocSection>

      <DocSection title="The resume you upload">
        <p>
          The file is held in memory for the length of the request while it is read, and
          is not written to disk on our servers. Once the response is returned, the file
          is gone from our side.
        </p>
        <p>
          The extracted record, the structured version of the resume you review in the
          editor, is stored in your own browser. It stays there until you clear it, and
          it is never sent anywhere except back to you.
        </p>
      </DocSection>

      <DocSection title="Account information">
        <p>
          Sign-in is handled by Amazon Cognito. We receive the claims in your identity
          token, typically your email address, your name if the pool provides one, and
          your group membership, and hold them in an encrypted, httpOnly session cookie.
          We do not receive or store your password.
        </p>
      </DocSection>

      <DocSection title="What we do not do">
        <DocList
          items={[
            'Sell, rent, or share candidate data with third parties.',
            'Use uploaded resumes to train models.',
            'Run advertising or third-party tracking scripts.',
            'Keep a copy of a resume after the request that processed it.',
          ]}
        />
      </DocSection>

      <DocSection title="Processors we rely on">
        <p>
          Extraction runs on Amazon Web Services in the US East (Ohio) region. Text from a
          resume is sent to a large language model provider to be structured. Those
          providers process the text to return a result and, under our agreements, do not
          retain it for training.
        </p>
      </DocSection>

      <DocSection title="Your rights">
        <p>
          Because we do not retain uploaded files, most requests are satisfied by clearing
          the record in your browser. For anything held against your account, such as session
          records and sign-in logs, write to us and we will action access, correction, or
          deletion requests within 30 days.
        </p>
      </DocSection>

      <DocSection title="Contact">
        <p>
          Questions about this policy:{' '}
          <a
            href="mailto:oceanbluesolutions@gmail.com"
            className="text-tc-azure underline underline-offset-2"
          >
            oceanbluesolutions@gmail.com
          </a>
          .
        </p>
      </DocSection>

      <DocNote>
        This document describes how the product is built. It is not legal advice, and it
        should be reviewed by counsel before you rely on it in a customer agreement.
      </DocNote>
    </>
  );
}
