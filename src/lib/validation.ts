/**
 * Validation Engine — deterministic TypeScript rules.
 * No AI. No random numbers. Every check is reproducible.
 */

export type Severity = 'CRITICAL' | 'WARNING' | 'INFO';

export type ValidationIssue = {
  id: string;
  field: string;
  severity: Severity;
  title: string;
  message: string;
  suggestedFix: string;
  evidence?: string;
  resolved: boolean;
};

export type ApplicationData = {
  full_name: string;
  email: string;
  school: string;
  current_grade: string;
  class9_pct: number | null;
  class10_pct: number | null;
  class11_pct: number | null;
  class12_pct_predicted: number | null;
  sat_taken: boolean;
  sat_score: number | null;
  ielts_taken: boolean;
  ielts_score: number | null;
  target_university: string;
  intended_major: string;
};

export type ValidationContext = {
  hasAcademicDoc: boolean;
  hasSatDoc: boolean;
};

function genId(): string {
  return `iss_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function checkPercentage(value: number | null, fieldName: string, displayName: string, issues: ValidationIssue[], required: boolean) {
  if (value === null || value === undefined || isNaN(value)) {
    if (required) {
      issues.push({
        id: genId(), field: fieldName, severity: 'WARNING',
        title: `${displayName} is missing`,
        message: `No ${displayName} has been entered.`,
        suggestedFix: `Enter your ${displayName} (0–100).`,
        resolved: false,
      });
    }
    return;
  }
  if (value < 0 || value > 100) {
    issues.push({
      id: genId(), field: fieldName, severity: 'CRITICAL',
      title: `${displayName} out of range`,
      message: `The value ${value}% is outside the valid range (0–100).`,
      suggestedFix: `Correct ${displayName} to a value between 0 and 100.`,
      resolved: false,
    });
  }
}

export function validateApplication(data: ApplicationData, ctx: ValidationContext): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Personal information
  if (!data.full_name || data.full_name.trim().length < 2) {
    issues.push({ id: genId(), field: 'full_name', severity: 'CRITICAL', title: 'Full name required', message: 'A full name is required for the application.', suggestedFix: 'Enter your full name.', resolved: false });
  }
  if (!data.email || !isValidEmail(data.email)) {
    issues.push({ id: genId(), field: 'email', severity: 'CRITICAL', title: 'Valid email required', message: 'A valid email address is required.', suggestedFix: 'Enter a valid email address (e.g. name@example.com).', resolved: false });
  }

  // Academics
  checkPercentage(data.class9_pct, 'class9_pct', 'Class 9 percentage', issues, false);
  checkPercentage(data.class10_pct, 'class10_pct', 'Class 10 percentage', issues, true);
  checkPercentage(data.class11_pct, 'class11_pct', 'Class 11 percentage', issues, false);
  checkPercentage(data.class12_pct_predicted, 'class12_pct_predicted', 'Predicted Class 12 percentage', issues, false);

  // Tests
  if (data.sat_taken) {
    if (data.sat_score === null || data.sat_score === undefined || isNaN(data.sat_score)) {
      issues.push({ id: genId(), field: 'sat_score', severity: 'CRITICAL', title: 'SAT score required', message: 'You indicated you have taken the SAT but no score was entered.', suggestedFix: 'Enter your SAT score (400–1600).', resolved: false });
    } else if (data.sat_score < 400 || data.sat_score > 1600) {
      issues.push({ id: genId(), field: 'sat_score', severity: 'CRITICAL', title: 'SAT score out of range', message: `The SAT score ${data.sat_score} is outside the valid range (400–1600).`, suggestedFix: 'Correct your SAT score to a value between 400 and 1600.', resolved: false });
    }
  }

  if (data.ielts_taken) {
    if (data.ielts_score === null || data.ielts_score === undefined || isNaN(data.ielts_score)) {
      issues.push({ id: genId(), field: 'ielts_score', severity: 'WARNING', title: 'IELTS score required', message: 'You indicated you have taken IELTS but no score was entered.', suggestedFix: 'Enter your IELTS score (0–9).', resolved: false });
    } else if (data.ielts_score < 0 || data.ielts_score > 9) {
      issues.push({ id: genId(), field: 'ielts_score', severity: 'CRITICAL', title: 'IELTS score out of range', message: `The IELTS score ${data.ielts_score} is outside the valid range (0–9).`, suggestedFix: 'Correct your IELTS score to a value between 0 and 9.', resolved: false });
    }
  }

  // University
  if (!data.target_university || data.target_university.trim().length < 2) {
    issues.push({ id: genId(), field: 'target_university', severity: 'CRITICAL', title: 'Target university required', message: 'A target university is required.', suggestedFix: 'Enter your target university.', resolved: false });
  }
  if (!data.intended_major || data.intended_major.trim().length < 2) {
    issues.push({ id: genId(), field: 'intended_major', severity: 'CRITICAL', title: 'Intended major required', message: 'An intended major is required.', suggestedFix: 'Enter your intended major.', resolved: false });
  }

  // Documents
  if (!ctx.hasAcademicDoc) {
    issues.push({ id: genId(), field: 'academic_doc', severity: 'WARNING', title: 'Academic document recommended', message: 'No academic supporting document has been uploaded. Uploading one enables automated verification.', suggestedFix: 'Upload your academic transcript or report card.', resolved: false });
  }
  if (data.sat_taken && !ctx.hasSatDoc) {
    issues.push({ id: genId(), field: 'sat_doc', severity: 'INFO', title: 'SAT report recommended', message: 'You indicated SAT taken but no SAT report uploaded. Uploading it enables automated verification.', suggestedFix: 'Upload your SAT score report.', resolved: false });
  }

  return issues;
}

/**
 * Calculate Application Health — deterministic weighted score.
 * NOT admission probability, NOT acceptance chance.
 * Measures completeness and consistency of the application.
 */
export type HealthBreakdown = {
  personal: number;
  academics: number;
  tests: number;
  university: number;
  documents: number;
  verification: number;
  total: number;
};

const WEIGHTS = {
  personal: 15,
  academics: 25,
  tests: 15,
  university: 15,
  documents: 20,
  verification: 10,
};

export function calculateHealth(
  data: ApplicationData,
  issues: ValidationIssue[],
  verificationPassed: number,
  verificationTotal: number,
  hasAcademicDoc: boolean,
  hasSatDoc: boolean
): HealthBreakdown {
  // Personal (15)
  let personal = 0;
  if (data.full_name && data.full_name.trim().length >= 2) personal += 7;
  if (data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) personal += 8;

  // Academics (25) — class10 is required, others are bonus
  let academics = 0;
  if (data.class9_pct !== null && data.class9_pct >= 0 && data.class9_pct <= 100) academics += 5;
  if (data.class10_pct !== null && data.class10_pct >= 0 && data.class10_pct <= 100) academics += 10;
  if (data.class11_pct !== null && data.class11_pct >= 0 && data.class11_pct <= 100) academics += 5;
  if (data.class12_pct_predicted !== null && data.class12_pct_predicted >= 0 && data.class12_pct_predicted <= 100) academics += 5;

  // Tests (15)
  let tests = 0;
  if (data.sat_taken) {
    if (data.sat_score !== null && data.sat_score >= 400 && data.sat_score <= 1600) tests += 10;
  } else {
    tests += 5; // not taken is valid, just less info
  }
  if (data.ielts_taken) {
    if (data.ielts_score !== null && data.ielts_score >= 0 && data.ielts_score <= 9) tests += 5;
  } else {
    tests += 5;
  }

  // University (15)
  let university = 0;
  if (data.target_university && data.target_university.trim().length >= 2) university += 8;
  if (data.intended_major && data.intended_major.trim().length >= 2) university += 7;

  // Documents (20)
  let documents = 0;
  if (hasAcademicDoc) documents += 12;
  if (hasSatDoc || !data.sat_taken) documents += 8;

  // Verification (10)
  let verification = 0;
  if (verificationTotal > 0) {
    verification = Math.round((verificationPassed / verificationTotal) * WEIGHTS.verification);
  } else if (hasAcademicDoc) {
    verification = 0; // docs uploaded but not yet analyzed
  }

  // Penalty for unresolved critical issues
  const unresolvedCritical = issues.filter((i) => !i.resolved && i.severity === 'CRITICAL').length;
  const penalty = Math.min(unresolvedCritical * 5, 15);
  const raw = personal + academics + tests + university + documents + verification;
  const total = Math.max(0, Math.min(100, raw - penalty));

  return {
    personal: Math.min(personal, WEIGHTS.personal),
    academics: Math.min(academics, WEIGHTS.academics),
    tests: Math.min(tests, WEIGHTS.tests),
    university: Math.min(university, WEIGHTS.university),
    documents: Math.min(documents, WEIGHTS.documents),
    verification: Math.min(verification, WEIGHTS.verification),
    total,
  };
}

/**
 * Determine application status from issues and health.
 */
export function determineStatus(issues: ValidationIssue[], conflicts: number, health: number): string {
  const unresolvedCritical = issues.filter((i) => !i.resolved && i.severity === 'CRITICAL').length;
  const unresolvedConflicts = conflicts;

  if (unresolvedCritical > 0 || unresolvedConflicts > 0) {
    return 'NEEDS_CORRECTION';
  }
  if (health >= 80) {
    return 'READY_FOR_REVIEW';
  }
  return 'NEEDS_CORRECTION';
}
