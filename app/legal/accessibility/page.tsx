import { DocHeader, DocList, DocNote, DocSection } from '@/components/legal/Doc';

export const metadata = { title: 'Accessibility' };

export default function Accessibility() {
  return (
    <>
      <DocHeader title="Accessibility" updated="31 July 2026" />

      <DocSection title="Our aim">
        <p>
          Truecopy is built to meet WCAG 2.1 level AA. State workforce submissions are
          public-sector work, and the tool that produces them should not exclude the
          people doing it.
        </p>
      </DocSection>

      <DocSection title="What is in place">
        <DocList
          items={[
            'Every control is reachable and operable by keyboard, with a visible focus ring.',
            'Text meets AA contrast against its background, including muted secondary text.',
            'Animation is decorative only, and stops entirely when the operating system asks for reduced motion.',
            'Form fields have persistent labels rather than placeholder-only labels.',
            'Loading states are announced to assistive technology instead of appearing silently.',
            'Layouts reflow to 320px without horizontal scrolling.',
          ]}
        />
      </DocSection>

      <DocSection title="Known gaps">
        <p>
          The split-pane divider in the editor is drag-driven and does not yet have a
          keyboard equivalent; use the Edit and Preview modes instead. The document
          preview reproduces the agency template exactly, which means its structure is
          fixed by the template rather than chosen by us.
        </p>
      </DocSection>

      <DocSection title="Tell us what is broken">
        <p>
          If something blocks you, write to{' '}
          <a
            href="mailto:oceanbluesolutions@gmail.com"
            className="text-tc-azure underline underline-offset-2"
          >
            oceanbluesolutions@gmail.com
          </a>{' '}
          with the page and what happened. Accessibility defects are treated as bugs, not
          feature requests.
        </p>
      </DocSection>

      <DocNote>
        This is a self-assessment of the current build, not a third-party audit or a
        published VPAT.
      </DocNote>
    </>
  );
}
