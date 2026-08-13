import type { Document } from 'docx';
import type { ResumeData } from '@/lib/types';
import { buildSubmissionFormDocument } from './submissionForm';
import { downloadDocx } from './download';

/** Pennsylvania: the same submission form, addressed to PeopleFluent. */
export function buildPADocument(data: ResumeData): Document {
  return buildSubmissionFormDocument(data, { requisitionSystem: 'PeopleFluent' });
}

/** Build the document and hand it to the browser as a download. */
export async function buildPADocx(data: ResumeData): Promise<void> {
  await downloadDocx(buildPADocument(data), data, 'Pennsylvania');
}
