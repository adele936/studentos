/**
 * Verification Engine
 * Compares submitted application data against extracted document data.
 * Produces verification checks with PASS / CONFLICT / NOT_VERIFIED results.
 */

import type { Confidence, ExtractedField } from './extraction';

export type VerificationResult = 'PASS' | 'CONFLICT' | 'POSSIBLE_CONFLICT' | 'NOT_VERIFIED';

export type VerificationCheck = {
  id: string;
  field: string;
  fieldLabel: string;
  submittedValue: string;
  documentValue: string;
  confidence: Confidence;
  result: VerificationResult;
  documentLabel: string;
};

type ComparisonField = {
  field: string;
  label: string;
  submitted: string | number | null | undefined;
};

function genId(): string {
  return `chk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Run verification between submitted data and extracted document fields.
 * Only compares fields where we have both a submitted value and an extracted value.
 */
export function runVerification(
  applicationData: Record<string, unknown>,
  extractedFields: ExtractedField[],
  documentLabel: string
): { checks: VerificationCheck[]; passed: number; conflicts: number; possibleConflicts: number } {
  const checks: VerificationCheck[] = [];
  let passed = 0;
  let conflicts = 0;
  let possibleConflicts = 0;

  // Build a map of extracted fields by field key
  const extractedMap = new Map<string, ExtractedField>();
  for (const f of extractedFields) {
    extractedMap.set(f.field, f);
  }

  // Define which fields to compare
  const fieldsToCompare: ComparisonField[] = [
    { field: 'full_name', label: 'Student Name', submitted: applicationData.full_name as string },
    { field: 'school', label: 'School', submitted: applicationData.school as string },
    { field: 'class9_pct', label: 'Class 9 %', submitted: applicationData.class9_pct as number },
    { field: 'class10_pct', label: 'Class 10 %', submitted: applicationData.class10_pct as number },
    { field: 'class11_pct', label: 'Class 11 %', submitted: applicationData.class11_pct as number },
    { field: 'class12_pct_predicted', label: 'Predicted Class 12 %', submitted: applicationData.class12_pct_predicted as number },
    { field: 'sat_score', label: 'SAT Score', submitted: applicationData.sat_score as number },
    { field: 'ielts_score', label: 'IELTS Score', submitted: applicationData.ielts_score as number },
  ];

  for (const field of fieldsToCompare) {
    const extracted = extractedMap.get(field.field);
    const submittedVal = field.submitted;

    // No submitted value — skip
    if (submittedVal === null || submittedVal === undefined || submittedVal === '') continue;

    // No extracted value for this field
    if (!extracted || extracted.value === null) {
      checks.push({
        id: genId(),
        field: field.field,
        fieldLabel: field.label,
        submittedValue: String(submittedVal),
        documentValue: '—',
        confidence: 'LOW',
        result: 'NOT_VERIFIED',
        documentLabel,
      });
      continue;
    }

    const docVal = String(extracted.value);
    const subVal = String(submittedVal);

    // Compare — normalize numeric comparison
    const subNum = parseFloat(subVal);
    const docNum = parseFloat(docVal);
    const bothNumeric = !isNaN(subNum) && !isNaN(docNum);
    const valuesMatch = bothNumeric
      ? Math.abs(subNum - docNum) < 0.01
      : subVal.trim().toLowerCase() === docVal.trim().toLowerCase();

    if (valuesMatch) {
      checks.push({
        id: genId(),
        field: field.field,
        fieldLabel: field.label,
        submittedValue: subVal,
        documentValue: docVal,
        confidence: extracted.confidence,
        result: 'PASS',
        documentLabel,
      });
      passed++;
    } else {
      // Low confidence → possible conflict, not hard conflict
      if (extracted.confidence === 'LOW') {
        checks.push({
          id: genId(),
          field: field.field,
          fieldLabel: field.label,
          submittedValue: subVal,
          documentValue: docVal,
          confidence: extracted.confidence,
          result: 'POSSIBLE_CONFLICT',
          documentLabel,
        });
        possibleConflicts++;
      } else {
        checks.push({
          id: genId(),
          field: field.field,
          fieldLabel: field.label,
          submittedValue: subVal,
          documentValue: docVal,
          confidence: extracted.confidence,
          result: 'CONFLICT',
          documentLabel,
        });
        conflicts++;
      }
    }
  }

  return { checks, passed, conflicts, possibleConflicts };
}

/**
 * Generate a human-readable explanation for a conflict.
 */
export function explainConflict(check: VerificationCheck): string {
  return `The value entered in the application (${check.submittedValue}) differs from the value detected in the uploaded supporting document (${check.documentValue}). This does not mean either value is wrong — it means the two sources disagree and should be reconciled before submission.`;
}
