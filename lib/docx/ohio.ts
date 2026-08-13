import type { Document } from 'docx';
import type { ResumeData } from '@/lib/types';
import { buildSubmissionFormDocument } from './submissionForm';
import { downloadDocx } from './download';

/** Ohio: the VMS submission form, addressed to VectorVMS. */
export function buildOhioDocument(data: ResumeData): Document {
  return buildSubmissionFormDocument(data, { requisitionSystem: 'VectorVMS' });
}

/** Build the document and hand it to the browser as a download. */
export async function buildOhioDocx(data: ResumeData): Promise<void> {
  await downloadDocx(buildOhioDocument(data), data, 'Ohio');
}
