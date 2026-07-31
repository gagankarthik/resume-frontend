import { DocHeader, DocList, DocNote, DocSection } from '@/components/legal/Doc';

export const metadata = { title: 'Data processing' };

export default function DataProcessing() {
  return (
    <>
      <DocHeader title="Data processing" updated="31 July 2026" />

      <DocSection title="Roles">
        <p>
          When you upload a candidate&rsquo;s resume, your organisation is the controller
          of that personal data and Oceanblue Solutions is a processor acting on your
          instructions. Your instruction is the upload itself: read this document, check
          it, and return it in the selected template.
        </p>
      </DocSection>

      <DocSection title="What is processed">
        <DocList
          items={[
            'Identifiers in the resume: name, email, phone, address, profile links.',
            'Employment history, education, skills, certifications, and projects.',
            'Anything else the candidate chose to put in the document.',
          ]}
        />
        <p>
          Nothing is inferred or added. Fields that do not appear in the source document
          are left empty rather than guessed.
        </p>
      </DocSection>

      <DocSection title="Retention">
        <p>
          The uploaded file is retained only for the duration of the request. The
          structured record is retained in your browser&rsquo;s local storage under your
          control. We hold no server-side copy of either.
        </p>
      </DocSection>

      <DocSection title="Sub-processors">
        <DocList
          items={[
            'Amazon Web Services: hosting and authentication, US East (Ohio).',
            'A large language model provider: structures the resume text and returns it. It does not retain it for training under our agreement.',
          ]}
        />
        <p>
          We will give notice before adding a sub-processor that handles candidate data.
        </p>
      </DocSection>

      <DocSection title="Transfers">
        <p>
          Processing takes place in the United States. If you are transferring personal
          data from the UK or EEA, standard contractual clauses should be put in place as
          part of your agreement with us.
        </p>
      </DocSection>

      <DocSection title="Assistance">
        <p>
          We will help you respond to data subject requests, and will notify you without
          undue delay if we become aware of a breach affecting your data.
        </p>
      </DocSection>

      <DocNote>
        A summary of how processing actually works, written to support a data processing
        agreement rather than replace one.
      </DocNote>
    </>
  );
}
