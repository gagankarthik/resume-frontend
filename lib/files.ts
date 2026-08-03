/**
 * What the app accepts for upload, in one place.
 *
 * The dropzone's `accept` map, the server-side check in /api/extract and every
 * sentence that lists the formats all read from this table. They used to be
 * three separate literals, which is how a list ends up saying "PDF, DOCX, DOC,
 * or TXT" in the UI while the code behind it accepts something else.
 *
 * This mirrors filetypes.py in the extraction engine. The engine is the real
 * authority — it decides format from the file's own bytes, so a mislabelled
 * upload still works — and these checks exist to fail fast and explain the
 * problem before a large file is sent anywhere.
 */

export type AcceptedType = {
  /** Canonical MIME type. */
  mime: string;
  /** Lowercase extensions, with the dot, as the file picker wants them. */
  extensions: string[];
  /** What this format is called in a sentence. */
  label: string;
};

export const ACCEPTED_TYPES: AcceptedType[] = [
  { mime: 'application/pdf', label: 'PDF', extensions: ['.pdf'] },
  {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    label: 'DOCX',
    extensions: ['.docx'],
  },
  { mime: 'application/msword', label: 'DOC', extensions: ['.doc'] },
  { mime: 'application/rtf', label: 'RTF', extensions: ['.rtf'] },
  { mime: 'text/plain', label: 'TXT', extensions: ['.txt'] },
];

/**
 * Extra MIME types that mean a format we already accept.
 *
 * Browsers disagree about RTF in particular, and an OS with no association for
 * an extension sends application/octet-stream for anything. Accepting the
 * aliases here keeps a valid resume from being turned away over a label.
 */
const MIME_ALIASES: Record<string, string> = {
  'text/rtf': 'application/rtf',
  'application/x-rtf': 'application/rtf',
  'application/doc': 'application/msword',
  'application/vnd.ms-word': 'application/msword',
};

export const MAX_UPLOAD_MB = 20;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

/** The `accept` prop react-dropzone expects: MIME → extensions. */
export const DROPZONE_ACCEPT: Record<string, string[]> = Object.fromEntries([
  ...ACCEPTED_TYPES.map(t => [t.mime, t.extensions] as const),
  // Aliases carry the same extensions, so a file picker filtered by type still
  // shows the file when the OS reports an unusual MIME for it.
  ...Object.entries(MIME_ALIASES).map(([alias, canonical]) => {
    const target = ACCEPTED_TYPES.find(t => t.mime === canonical);
    return [alias, target ? target.extensions : []] as const;
  }),
]);

const ALL_EXTENSIONS = ACCEPTED_TYPES.flatMap(t => t.extensions);

/** "PDF, DOCX, DOC, RTF, or TXT" — reads correctly at the end of a sentence. */
export function acceptedList(): string {
  const labels = ACCEPTED_TYPES.map(t => t.label);
  return `${labels.slice(0, -1).join(', ')}, or ${labels[labels.length - 1]}`;
}

/** "PDF, DOCX, DOC, RTF, TXT" — for a compact hint under a control. */
export function acceptedShort(): string {
  return ACCEPTED_TYPES.map(t => t.label).join(', ');
}

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot === -1 ? '' : filename.slice(dot).toLowerCase();
}

/** True when the name or the declared type matches something we read. */
export function isAcceptedFile(file: { name: string; type: string }): boolean {
  if (ALL_EXTENSIONS.includes(extensionOf(file.name))) return true;
  const mime = (file.type || '').split(';')[0].trim().toLowerCase();
  if (!mime) return false;
  return ACCEPTED_TYPES.some(t => t.mime === mime) || mime in MIME_ALIASES;
}

export type RejectionReason = 'empty' | 'too-large' | 'unsupported';

export type UploadRejection = {
  reason: RejectionReason;
  /** Written for the person who picked the file, not for a log. */
  message: string;
  /** What /api/extract answers with. Kept beside the reason so the two agree. */
  status: 400 | 413 | 415;
};

/**
 * Why this file can't be uploaded, or null when it can.
 *
 * Returns the reason as data rather than only a sentence, so the route can pick
 * a status code without pattern-matching on English. The message names the file
 * and says what to do about it — "invalid file" gives someone nothing to act on,
 * and they will just try the same file again.
 */
export function describeRejection(file: {
  name: string;
  type: string;
  size: number;
}): UploadRejection | null {
  if (file.size === 0) {
    return {
      reason: 'empty',
      status: 400,
      message: `“${file.name}” is empty. Check the file and try again.`,
    };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = file.size / (1024 * 1024);
    return {
      reason: 'too-large',
      status: 413,
      message: `“${file.name}” is ${mb.toFixed(1)} MB, over the ${MAX_UPLOAD_MB} MB limit. If it is mostly images, export it to PDF again without them.`,
    };
  }

  if (!isAcceptedFile(file)) {
    return { reason: 'unsupported', status: 415, message: unsupportedMessage(file.name) };
  }

  return null;
}

function unsupportedMessage(name: string): string {
  const ext = extensionOf(name).replace('.', '');

  if (['pages', 'odt', 'wpd'].includes(ext)) {
    return `“${name}” is a ${ext.toUpperCase()} document. Export it to PDF or DOCX and upload that instead.`;
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'heic', 'webp', 'tif', 'tiff'].includes(ext)) {
    return `“${name}” is an image. The text has to be selectable rather than pictured — upload the original document, or a PDF exported from it.`;
  }
  if (ext) {
    return `“${name}” is a .${ext} file. This tool reads ${acceptedList()} — save the resume as one of those and try again.`;
  }
  return `“${name}” has no file extension, so its format cannot be determined. Upload a ${acceptedList()} file.`;
}
