import JSZip from 'jszip';

/**
 * Just enough of the .xlsx format to write a report and read back a
 * one-sheet template, without pulling a spreadsheet library into the server.
 */

type Cell = string | number | boolean | null | undefined;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function colName(i: number): string {
  let s = '';
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

export async function writeXlsx(sheetName: string, header: string[], rows: Cell[][]): Promise<Uint8Array> {
  const all = [header, ...rows];
  const sheetRows = all
    .map((row, r) => {
      const cells = row
        .map((v, c) => {
          const ref = `${colName(c)}${r + 1}`;
          const style = r === 0 ? ' s="1"' : '';
          if (typeof v === 'number' && Number.isFinite(v)) return `<c r="${ref}"${style}><v>${v}</v></c>`;
          if (v == null || v === '') return '';
          return `<c r="${ref}" t="inlineStr"${style}><is><t xml:space="preserve">${esc(String(v))}</t></is></c>`;
        })
        .join('');
      return `<row r="${r + 1}">${cells}</row>`;
    })
    .join('');
  const widths = header
    .map((h, c) => {
      const longest = Math.max(h.length, ...rows.map(r => String(r[c] ?? '').length));
      return `<col min="${c + 1}" max="${c + 1}" width="${Math.min(60, Math.max(10, longest + 2))}" customWidth="1"/>`;
    })
    .join('');

  const zip = new JSZip();
  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
  );
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
  );
  zip.file(
    'xl/workbook.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${esc(sheetName.slice(0, 31))}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
  );
  zip.file(
    'xl/_rels/workbook.xml.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
  );
  zip.file(
    'xl/styles.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf/><xf fontId="1" applyFont="1"/></cellXfs></styleSheet>',
  );
  zip.file(
    'xl/worksheets/sheet1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths}</cols><sheetData>${sheetRows}</sheetData></worksheet>`,
  );
  return zip.generateAsync({ type: 'uint8array' });
}

const unesc = (s: string) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

function colIndex(ref: string): number {
  const letters = ref.replace(/\d+/g, '');
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/** Read the first sheet of an .xlsx into rows of strings. */
export async function readXlsx(data: ArrayBuffer): Promise<string[][]> {
  const zip = await JSZip.loadAsync(data);
  const shared: string[] = [];
  const sst = await zip.file('xl/sharedStrings.xml')?.async('string');
  if (sst) {
    for (const si of sst.match(/<si>[\s\S]*?<\/si>/g) ?? []) {
      shared.push(unesc((si.match(/<t[^>]*>([\s\S]*?)<\/t>/g) ?? []).map(t => t.replace(/<[^>]+>/g, '')).join('')));
    }
  }
  const sheetPath = Object.keys(zip.files).find(p => /^xl\/worksheets\/sheet\d+\.xml$/.test(p));
  const xml = sheetPath ? await zip.file(sheetPath)!.async('string') : '';
  const rows: string[][] = [];
  for (const row of xml.match(/<row[^>]*>[\s\S]*?<\/row>/g) ?? []) {
    const out: string[] = [];
    for (const c of row.match(/<c [^>]*?(\/>|>[\s\S]*?<\/c>)/g) ?? []) {
      const ref = c.match(/r="([A-Z]+\d+)"/)?.[1];
      const type = c.match(/t="([^"]+)"/)?.[1];
      const v = c.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      const inline = c.match(/<t[^>]*>([\s\S]*?)<\/t>/)?.[1];
      const val = type === 's' && v != null ? shared[Number(v)] ?? '' : type === 'inlineStr' ? unesc(inline ?? '') : unesc(v ?? '');
      out[ref ? colIndex(ref) : out.length] = val;
    }
    rows.push(Array.from(out, x => x ?? ''));
  }
  return rows;
}

/** Parse CSV (quoted fields, commas, newlines) into rows. */
export function readCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cur); rows.push(row); row = []; cur = '';
    } else cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim()));
}

export function toCsv(header: string[], rows: Cell[][]): string {
  const cell = (v: Cell) => {
    const s = v == null ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [header, ...rows].map(r => r.map(cell).join(',')).join('\r\n');
}
