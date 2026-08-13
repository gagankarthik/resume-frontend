import { Document, Packer } from 'docx';
import { saveAs } from 'file-saver';
import type { ResumeData } from '@/lib/types';
import { text } from './shared';

/** Characters Windows and macOS refuse in a filename. */
const ILLEGAL_IN_FILENAME = /[\\/:*?"<>|]/g;

/** Anything below space: never legal in a filename, never visible if it were. */
const CONTROL_CHARS = new RegExp('[\\u0000-\\u001f]', 'g');

/**
 * Pack the document and hand it to the browser.
 *
 * The filename carries the candidate's name, which is arbitrary text off a
 * resume: "Smith, John / Jane" and names written with a colon both occur. A
 * slash in a download name is rejected silently, so the file never lands and
 * the recruiter sees a download button that did nothing.
 */
export async function downloadDocx(doc: Document, data: ResumeData, template: string): Promise<void> {
  const name = text(data?.name)
    .replace(ILLEGAL_IN_FILENAME, ' ')
    .replace(CONTROL_CHARS, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${name || 'Resume'}_${template}.docx`);
}
