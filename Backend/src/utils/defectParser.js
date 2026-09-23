const pdfParse = require('pdf-parse');
const mammoth  = require('mammoth');
const XLSX     = require('xlsx');
const fs       = require('fs');

// ─── field name → model field mapping ─────────────────────────────────────────
const FIELD_MAP = [
  // each entry: [modelField, regex that matches the raw label]
  ['title',             /^(title|summary|defect\s*title|bug\s*title|name|subject)$/i],
  ['description',       /^(description|desc|details?|overview|notes?|background|context|finding)$/i],
  ['stepsToReproduce',  /^(steps?(\s*to\s*repro(duce)?)?|repro(\s*steps?)?|reproduction\s*steps?|how\s*to\s*reproduce?)$/i],
  ['expectedResult',    /^(expected(\s*(result|behavior|behaviour|outcome|output))?|expectation)$/i],
  ['actualResult',      /^(actual(\s*(result|behavior|behaviour|outcome|output))?|observed(\s*(result|behavior|behaviour))?)$/i],
  ['severity',          /^(severity|sev|impact)$/i],
  ['priority',          /^(priority|prio|urgency)$/i],
  ['status',            /^(status|state)$/i],
  ['environment',       /^(environment|env|test\s*env(ironment)?)$/i],
  ['module',            /^(module(\s*\/\s*component)?|component|area|feature|section|page|screen)$/i],
  ['browser',           /^(browser(\s*\/?\s*(app\s*)?version)?|platform)$/i],
  ['buildVersion',      /^(build(\s*version)?|app\s*version|version|release)$/i],
  ['device',            /^(device(\s*\/?\s*os)?|os|operating\s*system)$/i],
  ['tags',              /^(tags?|labels?|keywords?|category|categories)$/i],
  ['reproducibility',   /^(reproducibility|repro\s*rate|frequency|how\s*often)$/i],
  ['assignee',          /^(assignee|assigned\s*to|owner|responsible)$/i],
  ['rootCause',         /^(root\s*cause|rca|cause|reason)$/i],
  ['linkedTestCase',    /^(test\s*case(\s*id)?|tc\s*id|testcase)$/i],
  ['linkedRequirement', /^(requirement(\s*id)?|req\s*id|user\s*story)$/i],
  ['sprintId',          /^(sprint(\s*id)?|iteration)$/i],
  ['releaseVersion',    /^(release(\s*version)?|milestone|fix\s*version)$/i],
];

// Fields to silently skip — they appear in audit reports but are not defect data
const SKIP_FIELDS = /^(evidence|recommendation|ref(erence)?|note|see\s*also|screenshot|ss_)$/i;

const SEVERITY_VALUES = ['blocker', 'critical', 'major', 'minor', 'trivial'];
const PRIORITY_VALUES = ['urgent', 'high', 'medium', 'low'];
const REPRO_VALUES    = ['always', 'sometimes', 'rarely', 'unable'];
const STATUS_VALUES   = [
  'new','open','assigned','in_progress','ready_for_qa','retest','verified',
  'closed','reopened','deferred','duplicate','cannot_reproduce','rejected','blocked',
];

// ─── utilities ────────────────────────────────────────────────────────────────

// Strip **bold**, *italic*, `code`, # headings, backtick content
function stripMd(s = '') {
  return String(s)
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g,     '$1')
    .replace(/__([^_]+)__/g,     '$1')
    .replace(/`([^`]*)`/g,       '$1')
    .replace(/^#+\s+/,           '')
    .trim();
}

function normalizeEnum(val, allowed) {
  const v = String(val).toLowerCase().trim().replace(/[\s\-]+/g, '_');
  return (
    allowed.find(a => a === v) ||
    allowed.find(a => v.includes(a)) ||
    allowed.find(a => a.includes(v))
  );
}

// Map a raw key + value into the defect object
function applyField(obj, rawKey, rawVal) {
  const key = stripMd(rawKey).trim().replace(/\s+/g, ' ');
  const val = stripMd(String(rawVal)).trim();
  if (!key || !val) return;
  if (SKIP_FIELDS.test(key)) return;   // ignore Evidence, Recommendation, etc.

  for (const [field, rx] of FIELD_MAP) {
    if (rx.test(key)) {
      switch (field) {
        case 'severity':        obj.severity        = normalizeEnum(val, SEVERITY_VALUES) || 'minor';  return;
        case 'priority':        obj.priority        = normalizeEnum(val, PRIORITY_VALUES) || 'medium'; return;
        case 'reproducibility': obj.reproducibility = normalizeEnum(val, REPRO_VALUES)    || 'always'; return;
        case 'status':          obj.status          = normalizeEnum(val, STATUS_VALUES)   || 'new';    return;
        case 'tags':            obj.tags            = val.split(/[,;|]/).map(t => stripMd(t).trim()).filter(Boolean); return;
        default:                obj[field]          = val; return;
      }
    }
  }
  // Unknown key — store in description if description is empty, else ignore
}

// ─── inline "Key: Value. Key: Value." line splitter ───────────────────────────
//
// Handles: "Module: People → Employees. Severity: Medium. Priority: High."
// Keys must start with a capital letter (they are field labels, not sentence text)
// Split on ". CapitalWord(s):" pattern only

function splitDotSeparatedFields(line) {
  // Find positions of "CapitalWord(s): " that appear after a period or at start
  const positions = [];
  // Match:  (start | ". ")  CapitalLetter word(s)  ":"
  const re = /(?:^|\.\s+)([A-Z][A-Za-z0-9 /()→‑\-]{1,50}?)\s*:/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    // m.index points to the "." or start; key starts after ". "
    const keyStart = m.index === 0 ? 0 : m.index + 2; // skip ". "
    positions.push({ key: m[1].trim(), keyStart, valStart: m.index + m[0].length });
  }
  if (positions.length < 2) return []; // only split if 2+ fields on line

  const results = [];
  for (let i = 0; i < positions.length; i++) {
    const valEnd = i + 1 < positions.length
      ? positions[i + 1].keyStart - 2  // stop before ". NextKey"
      : line.length;
    const val = line.slice(positions[i].valStart, valEnd).replace(/\.\s*$/, '').trim();
    if (val) results.push({ key: positions[i].key, val });
  }
  return results;
}

// ─── parse one defect block ───────────────────────────────────────────────────
//
// A block is everything from one defect heading to the next.
// The heading line has already been extracted (it IS the title).

function parseDefectBlock(titleLine, bodyLines) {
  const obj = {};

  // Extract title from the heading:  **EMP-01 — Title text**
  // or just use the whole stripped line if no em-dash
  const stripped = stripMd(titleLine);
  const dashMatch = stripped.match(/^[\w\d][\w\d\-‑]*\s*[—–\-]{1,3}\s*(.+)$/);
  obj.title = dashMatch ? dashMatch[1].trim() : stripped;

  let currentField = null;
  let buffer       = [];

  const flush = () => {
    if (!currentField) return;
    const val = buffer.join('\n').trim();
    if (val) applyField(obj, currentField, val);
    currentField = null;
    buffer       = [];
  };

  for (const raw of bodyLines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }

    // Try dot-separated multi-field line:  Module: X. Severity: Y. Priority: Z.
    const dotFields = splitDotSeparatedFields(line);
    if (dotFields.length >= 2) {
      flush();
      for (const { key, val } of dotFields) applyField(obj, key, val);
      continue;
    }

    // Try single "Key: value" line
    // Key: optional **, word chars + spaces + slashes etc, optional **, then ":"
    const kvMatch = line.match(/^(?:\*{1,2})?\s*([\w][\w\s/()→‑\-]{0,60}?)(?:\*{1,2})?\s*:\s*(.*)$/);
    if (kvMatch) {
      flush();
      currentField = kvMatch[1].trim();
      const rest   = kvMatch[2].trim();
      if (rest) buffer.push(rest);
    } else if (currentField) {
      // Continuation of previous multi-line field
      buffer.push(line);
    }
  }
  flush();

  return obj;
}

// ─── Strategy 1: bold-heading defects ─────────────────────────────────────────
//
// Detects documents where each defect starts with a bold ID heading:
//   **EMP-01 — Title**   or   **BUG-1: Title**   or   **1. Title**
//
// This is the most reliable split strategy — we find all heading lines first,
// then everything between two headings is one defect's body.

const DEFECT_HEADING_RE = /^\*{1,2}[\w\d][\w\d\-‑]*\s*(?:[—–:\-]|\d+\.)\s*.{4,}/;

function parseByBoldHeadings(lines) {
  const headingIndexes = [];
  for (let i = 0; i < lines.length; i++) {
    if (DEFECT_HEADING_RE.test(lines[i].trim())) {
      headingIndexes.push(i);
    }
  }
  if (headingIndexes.length < 1) return null;

  const defects = [];
  for (let h = 0; h < headingIndexes.length; h++) {
    const titleLine = lines[headingIndexes[h]];
    const bodyEnd   = h + 1 < headingIndexes.length ? headingIndexes[h + 1] : lines.length;
    const bodyLines = lines.slice(headingIndexes[h] + 1, bodyEnd);
    const obj = parseDefectBlock(titleLine, bodyLines);
    if (obj.title && obj.title.length >= 4) defects.push(obj);
  }
  return defects.length ? defects : null;
}

// ─── Strategy 2: blank-line-separated key-value blocks ────────────────────────
//
// For documents that look like:
//   Title: Login broken
//   Severity: critical
//   Steps: …
//   <blank line>
//   Title: Another bug
//   …

function parseByKVBlocks(text) {
  const blocks = text.split(/\n{2,}/).map(b => b.trim()).filter(b => b.length > 3);
  const defects = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    // A valid KV block has at least one "Key: value" line
    const hasKV = lines.some(l => /^[\w][\w\s/()→‑\-]{0,60}?\s*:\s*.+/.test(l.trim()));
    if (!hasKV) continue;

    const obj = {};
    let currentField = null;
    let buffer       = [];

    const flush = () => {
      if (!currentField) return;
      const val = buffer.join('\n').trim();
      if (val) applyField(obj, currentField, val);
      currentField = null;
      buffer       = [];
    };

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) { flush(); continue; }

      const dotFields = splitDotSeparatedFields(line);
      if (dotFields.length >= 2) {
        flush();
        for (const { key, val } of dotFields) applyField(obj, key, val);
        continue;
      }

      const kv = line.match(/^(?:\*{1,2})?\s*([\w][\w\s/()→‑\-]{0,60}?)(?:\*{1,2})?\s*:\s*(.*)$/);
      if (kv) {
        flush();
        currentField = kv[1].trim();
        const rest   = kv[2].trim();
        if (rest) buffer.push(rest);
      } else if (currentField) {
        buffer.push(line);
      } else {
        // Line with no key prefix and no current field → treat as title if obj.title empty
        const clean = stripMd(line);
        if (!obj.title && clean.length >= 4) obj.title = clean;
      }
    }
    flush();

    if (obj.title) defects.push(obj);
  }
  return defects.length ? defects : null;
}

// ─── Strategy 3: plain list fallback ──────────────────────────────────────────
function parseAsList(text) {
  return text.split('\n')
    .map(l => stripMd(l).trim())
    .filter(l => l.length >= 5 && !/^#{1,6}\s/.test(l))
    .map(title => ({ title }));
}

// ─── main text dispatcher ─────────────────────────────────────────────────────
function parseTextToDefects(rawText) {
  const text  = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = text.split('\n');

  // Strategy 1: bold-heading format (audit reports, structured docs)
  const byHeading = parseByBoldHeadings(lines);
  if (byHeading) {
    console.log(`[parser] strategy=bold-headings found=${byHeading.length}`);
    return byHeading;
  }

  // Strategy 2: blank-line-separated KV blocks
  const byBlocks = parseByKVBlocks(text);
  if (byBlocks) {
    console.log(`[parser] strategy=kv-blocks found=${byBlocks.length}`);
    return byBlocks;
  }

  // Strategy 3: list fallback
  const list = parseAsList(text);
  console.log(`[parser] strategy=list-fallback found=${list.length}`);
  return list;
}

// ─── file format readers ──────────────────────────────────────────────────────
async function getRawText(filePath, mimetype) {
  const ext = filePath.split('.').pop().toLowerCase();
  if (ext === 'pdf' || mimetype === 'application/pdf') {
    const { text } = await pdfParse(fs.readFileSync(filePath));
    return text;
  }
  if (['docx','doc'].includes(ext) || mimetype?.includes('wordprocessingml') || mimetype?.includes('msword')) {
    const { value } = await mammoth.extractRawText({ path: filePath });
    return value;
  }
  return fs.readFileSync(filePath, 'utf8');
}

async function parsePDF(filePath) {
  const { text } = await pdfParse(fs.readFileSync(filePath));
  console.log('[parser:pdf] first 1200:\n', text.slice(0, 1200));
  return parseTextToDefects(text);
}

async function parseWord(filePath) {
  const { value: text } = await mammoth.extractRawText({ path: filePath });
  console.log('[parser:word] first 1200:\n', text.slice(0, 1200));
  return parseTextToDefects(text);
}

function parseExcel(filePath) {
  const wb = XLSX.readFile(filePath);
  const defects = [];
  for (const sheetName of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });
    if (!rows.length) continue;
    console.log('[parser:excel] sheet:', sheetName, 'headers:', Object.keys(rows[0]));
    for (const row of rows) {
      const obj = {};
      for (const [rawKey, rawVal] of Object.entries(row)) {
        if (rawVal === '' || rawVal === null || rawVal === undefined) continue;
        applyField(obj, rawKey, String(rawVal));
      }
      if (obj.title) defects.push(obj);
    }
  }
  return defects;
}

async function parseDefectsFromFile(filePath, mimetype) {
  const ext = filePath.split('.').pop().toLowerCase();

  if (ext === 'pdf' || mimetype === 'application/pdf')
    return parsePDF(filePath);

  if (['docx','doc'].includes(ext) || mimetype?.includes('wordprocessingml') || mimetype?.includes('msword'))
    return parseWord(filePath);

  if (['xlsx','xls','csv'].includes(ext) || mimetype?.includes('spreadsheet') || mimetype?.includes('excel') || mimetype?.includes('csv'))
    return parseExcel(filePath);

  const text = fs.readFileSync(filePath, 'utf8');
  console.log('[parser:txt] first 1200:\n', text.slice(0, 1200));
  return parseTextToDefects(text);
}

module.exports = { parseDefectsFromFile, getRawText };
