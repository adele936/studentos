/**
 * Free Document Extraction Engine
 * Uses pdfjs-dist for PDF text extraction and regex-based field parsing.
 * No paid APIs, no external AI — all processing is client-side and deterministic.
 */

export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';

export type ExtractedField = {
  field: string;
  value: string | number | null;
  rawMatch: string;
  confidence: Confidence;
  source: string;
};

export type ExtractionResult = {
  text: string;
  fields: ExtractedField[];
  status: 'SUCCESS' | 'NO_TEXT' | 'NO_FIELDS' | 'UNSUPPORTED' | 'ERROR';
  message: string;
};

const SUPPORTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

export function isSupportedFileType(file: File): boolean {
  return SUPPORTED_TYPES.includes(file.type) || /\.(pdf|png|jpe?g)$/i.test(file.name);
}

/**
 * Extract text from a PDF file using pdfjs-dist (PDF.js).
 * Runs entirely in the browser — no server calls.
 */
export async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  // Dynamic import to keep the main bundle smaller and avoid worker setup issues
  const pdfjs = await import('pdfjs-dist');

  // Use the bundled worker via CDN matching the installed version
  const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: unknown) => {
        if (typeof item === 'object' && item !== null && 'str' in item) {
          return (item as { str: string }).str;
        }
        return '';
      })
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText.trim();
}

/**
 * Normalize text: collapse whitespace, trim, standardize common variations.
 */
function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── Field extractors ──────────────────────────────────────────

/**
 * Extract a percentage value (0-100) from text.
 * Looks for labels like "Class 10 Percentage", "Class X %", "Overall Percentage" etc.
 */
export function extractPercentage(text: string, labelPattern: string[]): ExtractedField | null {
  const normalized = normalizeText(text);
  for (const pattern of labelPattern) {
    // "Label: 93%" or "Label - 93%" or "Label 93 %" or "Label 93%"
    const regex = new RegExp(
      `${pattern}\\s*[:\\-–]?\\s*(\\d{1,3}(?:\\.\\d+)?)\\s*%?`,
      'i'
    );
    const match = normalized.match(regex);
    if (match) {
      const value = parseFloat(match[1]);
      if (!isNaN(value) && value >= 0 && value <= 100) {
        const hasExactLabel = new RegExp(`\\b${pattern}\\b`, 'i').test(normalized);
        return {
          field: pattern,
          value,
          rawMatch: match[0].trim(),
          confidence: hasExactLabel ? 'HIGH' : 'MEDIUM',
          source: 'document',
        };
      }
    }
  }
  return null;
}

/**
 * Extract SAT score (400-1600) from text.
 */
export function extractSatScore(text: string): ExtractedField | null {
  const normalized = normalizeText(text);
  const patterns = [
    /SAT\s*(?:Score|Total)?\s*[:\-–]?\s*(\d{3,4})/i,
    /SAT\s*(?:Score|Total)?\s*[:\-–]?\s*(\d{3,4})/i,
  ];
  for (const regex of patterns) {
    const match = normalized.match(regex);
    if (match) {
      const value = parseInt(match[1], 10);
      if (!isNaN(value) && value >= 400 && value <= 1600) {
        const hasExactLabel = /SAT\s*(Score|Total)\s*[:\-–]/i.test(normalized);
        return {
          field: 'SAT Score',
          value,
          rawMatch: match[0].trim(),
          confidence: hasExactLabel ? 'HIGH' : 'MEDIUM',
          source: 'document',
        };
      }
    }
  }
  return null;
}

/**
 * Extract IELTS score (0-9) from text.
 */
export function extractIeltsScore(text: string): ExtractedField | null {
  const normalized = normalizeText(text);
  const regex = /IELTS\s*(?:Score|Overall|Band)?\s*[:\-–]?\s*(\d(?:\.\d)?)\s*/i;
  const match = normalized.match(regex);
  if (match) {
    const value = parseFloat(match[1]);
    if (!isNaN(value) && value >= 0 && value <= 9) {
      const hasExactLabel = /IELTS\s*(Score|Overall|Band)\s*[:\-–]/i.test(normalized);
      return {
        field: 'IELTS Score',
        value,
        rawMatch: match[0].trim(),
        confidence: hasExactLabel ? 'HIGH' : 'MEDIUM',
        source: 'document',
      };
    }
  }
  return null;
}

/**
 * Extract student name from text.
 */
export function extractStudentName(text: string): ExtractedField | null {
  const normalized = normalizeText(text);
  const patterns = [
    /(?:Student\s*Name|Name|Candidate\s*Name)\s*[:\-–]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/,
    /(?:Student\s*Name|Name|Candidate\s*Name)\s*[:\-–]?\s*([A-Z][A-Z\s]+)/,
  ];
  for (const regex of patterns) {
    const match = normalized.match(regex);
    if (match) {
      const name = match[1].trim().replace(/\s+/g, ' ');
      if (name.length >= 3) {
        return {
          field: 'Student Name',
          value: name,
          rawMatch: match[0].trim(),
          confidence: 'HIGH',
          source: 'document',
        };
      }
    }
  }
  return null;
}

/**
 * Extract school name from text.
 */
export function extractSchool(text: string): ExtractedField | null {
  const normalized = normalizeText(text);
  const regex = /(?:School|Institute|College)\s*[:\-–]?\s*(.+)/i;
  const match = normalized.match(regex);
  if (match) {
    const school = match[1].trim().split('\n')[0].trim();
    if (school.length >= 2 && school.length <= 100) {
      return {
        field: 'School',
        value: school,
        rawMatch: match[0].trim(),
        confidence: 'MEDIUM',
        source: 'document',
      };
    }
  }
  return null;
}

/**
 * Parse all structured fields from extracted document text.
 */
export function parseAllFields(text: string): ExtractedField[] {
  const fields: ExtractedField[] = [];
  const normalized = normalizeText(text);

  // Class 9
  const class9 = extractPercentage(normalized, ['Class 9 Percentage', 'Class IX Percentage', 'Class 9 %', 'Class IX %']);
  if (class9) fields.push({ ...class9, field: 'class9_pct' });

  // Class 10
  const class10 = extractPercentage(normalized, ['Class 10 Percentage', 'Class X Percentage', 'Class 10 %', 'Class X %', 'Overall Percentage', 'Secondary Percentage']);
  if (class10) fields.push({ ...class10, field: 'class10_pct' });

  // Class 11
  const class11 = extractPercentage(normalized, ['Class 11 Percentage', 'Class XI Percentage', 'Class 11 %', 'Class XI %']);
  if (class11) fields.push({ ...class11, field: 'class11_pct' });

  // Class 12 predicted
  const class12 = extractPercentage(normalized, ['Class 12 Percentage', 'Class XII Percentage', 'Predicted Class 12', 'Class 12 %', 'Class XII %']);
  if (class12) fields.push({ ...class12, field: 'class12_pct_predicted' });

  // SAT
  const sat = extractSatScore(normalized);
  if (sat) fields.push({ ...sat, field: 'sat_score' });

  // IELTS
  const ielts = extractIeltsScore(normalized);
  if (ielts) fields.push({ ...ielts, field: 'ielts_score' });

  // Student name
  const name = extractStudentName(normalized);
  if (name) fields.push({ ...name, field: 'full_name' });

  // School
  const school = extractSchool(normalized);
  if (school) fields.push({ ...school, field: 'school' });

  return fields;
}

/**
 * Main extraction entry point.
 * Handles PDF text extraction and field parsing.
 * For images, returns NO_TEXT (OCR not bundled to keep things lightweight).
 */
export async function extractFromFile(file: File): Promise<ExtractionResult> {
  if (!isSupportedFileType(file)) {
    return {
      text: '',
      fields: [],
      status: 'UNSUPPORTED',
      message: 'Unsupported file type. Please upload a PDF, PNG, or JPG file.',
    };
  }

  try {
    let rawText = '';

    if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
      rawText = await extractPdfText(file);
    } else {
      // Image files — OCR (Tesseract.js) could be added here in P1
      return {
        text: '',
        fields: [],
        status: 'NO_TEXT',
        message: 'Automatic extraction could not confidently read this document. Manual review is recommended.',
      };
    }

    if (!rawText || rawText.trim().length < 10) {
      return {
        text: rawText,
        fields: [],
        status: 'NO_TEXT',
        message: 'Automatic extraction could not confidently read this document. Manual review is recommended.',
      };
    }

    const fields = parseAllFields(rawText);

    if (fields.length === 0) {
      return {
        text: rawText,
        fields: [],
        status: 'NO_FIELDS',
        message: 'Document text was extracted, but no recognized fields were found. Manual review is recommended.',
      };
    }

    return {
      text: rawText,
      fields,
      status: 'SUCCESS',
      message: `Successfully extracted ${fields.length} field(s) from document.`,
    };
  } catch {
    return {
      text: '',
      fields: [],
      status: 'ERROR',
      message: 'An error occurred while processing the document. Please try again or upload a different file.',
    };
  }
}

/**
 * Generate a downloadable demo document as a text file.
 * This is NOT special-cased in the extraction engine — it's processed like any other file.
 * We generate a .txt file that the extraction engine can read just like a PDF.
 */
export function generateDemoDocument(): { content: string; fileName: string } {
  const content = `ALGOTHON DEMO DOCUMENT
========================

Student Name: Demo Student
School: Demo Public School

Class 10 Percentage: 93%
SAT Score: 1450

This is SAMPLE/DEMO DATA for demonstration purposes only.
It is not a real academic record.

Generated by Admitiy Application Intelligence.`;

  return { content, fileName: 'demo-application-document.txt' };
}
