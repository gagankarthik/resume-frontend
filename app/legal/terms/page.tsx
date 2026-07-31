import { DocHeader, DocList, DocNote, DocSection } from '@/components/legal/Doc';

export const metadata = { title: 'Terms of service' };

export default function Terms() {
  return (
    <>
      <DocHeader title="Terms of service" updated="31 July 2026" />

      <DocSection title="Agreement">
        <p>
          These terms govern your use of Truecopy, operated by Oceanblue Solutions. By
          uploading a document you accept them. If you are using Truecopy on behalf of an
          employer, you confirm you are authorised to accept on its behalf.
        </p>
      </DocSection>

      <DocSection title="What the service does">
        <p>
          Truecopy reads a resume, extracts its sections, checks the result against the
          source, and produces a Word document in a selected template. It is a formatting
          and transcription tool. It does not screen, score, rank, or make any decision
          about a candidate.
        </p>
      </DocSection>

      <DocSection title="Your responsibilities">
        <DocList
          items={[
            'You have the right to upload each resume and to process it for the purpose you are using it for.',
            'You review the extracted record before exporting. The review step exists because automated extraction is not perfect.',
            'You do not upload malware, or content you have no permission to process.',
            'You keep your sign-in credentials to yourself.',
          ]}
        />
      </DocSection>

      <DocSection title="Accuracy">
        <p>
          Extraction is checked line by line against the source and gaps are flagged, but
          no automated system is perfect. The exported document is yours once you export
          it, and you are responsible for what you submit. Truecopy is provided without
          warranty that every field will be captured correctly.
        </p>
      </DocSection>

      <DocSection title="Availability">
        <p>
          We aim to keep the service running but do not commit to an uptime figure unless
          one is set out in a separate written agreement. Processing may be rate limited
          or paused for maintenance.
        </p>
      </DocSection>

      <DocSection title="Liability">
        <p>
          To the extent permitted by law, Oceanblue Solutions is not liable for indirect
          or consequential loss arising from use of the service, and total liability is
          limited to the fees paid for the service in the twelve months before the claim.
        </p>
      </DocSection>

      <DocSection title="Changes and termination">
        <p>
          We may update these terms; material changes will be dated at the top of this
          page. We may suspend access that threatens the security or availability of the
          service.
        </p>
      </DocSection>

      <DocSection title="Contact">
        <p>
          <a
            href="mailto:oceanbluesolutions@gmail.com"
            className="text-tc-azure underline underline-offset-2"
          >
            oceanbluesolutions@gmail.com
          </a>
        </p>
      </DocSection>

      <DocNote>
        A starting point drafted to match how the product actually works. Have counsel
        review it before you put it in front of a customer.
      </DocNote>
    </>
  );
}
