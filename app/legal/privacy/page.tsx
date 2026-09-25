import { DocHeader, DocList, DocNote, DocSection } from '@/components/legal/Doc';

export const metadata = { title: 'Privacy policy' };

export default function Privacy() {
  return (
    <>
      <DocHeader title="Privacy policy" updated="25 September 2026" />

      <DocSection title="What this covers">
        <p>
          Hire is operated by Oceanblue Solutions. This policy describes what happens
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
          editor, is stored in your own browser until you clear it. A copy is also kept on
          our side, encrypted, so it can feed your organisation&rsquo;s talent heat map. That
          copy is kept until your organisation asks us to delete it.
        </p>
        <p>
          The heat map is shared with everyone signed in to your organisation. It shows
          where candidates work (employer, job title, skills, years of experience, and
          location) and never shows names, email addresses, or phone numbers. City and
          state are sent to Amazon Location Service to place them on the map.
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
            'Keep the resume file after the request that processed it.',
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
          We do not retain uploaded files. For a stored extracted record, or anything held
          against your account such as session records and sign-in logs, write to us and
          we will action access, correction, or deletion requests within 30 days.
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
