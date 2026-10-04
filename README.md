# Admitiy Application Intelligence

**ALGOTHON'26 · Problem Statement: ALG-AUTO-02 — Smart Application Processing**

> "Verify applications before humans have to."

## Problem

Traditional application processing is manual: a human reads the form, opens supporting documents, finds discrepancies, contacts the applicant, and re-checks. This is slow, error-prone, and expensive.

## Solution

Admitiy Application Intelligence automates the verification pipeline:

```
Student application
→ validation
→ document upload
→ document information extraction
→ comparison against submitted information
→ inconsistency detection
→ explanation
→ correction
→ re-validation
→ READY FOR REVIEW
```

## Key Features

- **Multi-step application form** (personal, academics, tests, university, documents)
- **Free PDF text extraction** using pdfjs-dist (PDF.js) — runs entirely in the browser
- **Rule-based field parser** with regex patterns for percentages, SAT scores, IELTS scores, names, and schools
- **Confidence levels** (HIGH / MEDIUM / LOW) based on how clearly the field label matched
- **Deterministic validation engine** — no AI, no random numbers
- **Verification matrix** comparing submitted values against extracted document values
- **Correction Center** with issue cards, evidence, explanations, and fix workflow
- **Re-run checks** after corrections — conflicts disappear, health updates
- **Application Health score** (0–100) — deterministic weighted calculation
- **Processing timeline** — audit trail with real timestamps
- **Reviewer Preview** — shows the processed application in reviewer format
- **Demo document** — downloadable sample that the engine processes like any real file

## Architecture

```
Applicant
    ↓
Admitiy Application UI (React)
    ↓
Validation Engine (deterministic TypeScript rules)
    ↓
Free Local Document Parser (pdfjs-dist / PDF.js)
    ↓
Verification Engine (submitted vs extracted comparison)
    ↓
Consistency Checker (conflict detection + confidence)
    ↓
Supabase (database + RLS)
    ↓
Correction Center (fix issues → re-run checks)
    ↓
Reviewer Preview
```

## Free / Open-Source Technology Used

| Component | Technology | Cost |
|-----------|-----------|------|
| Frontend | React + Vite + TypeScript | Free |
| UI icons | lucide-react | Free |
| PDF extraction | pdfjs-dist (PDF.js by Mozilla) | Free / MIT |
| Database | Supabase (free tier) | Free |
| Auth | Supabase Auth (email/password) | Free |
| Storage | Supabase Storage | Free |
| Field parsing | Custom regex-based TypeScript | Free |
| Validation | Deterministic TypeScript rules | Free |

**No paid APIs used. No OpenAI, Anthropic, Gemini, or paid OCR.**

## How Document Processing Works

1. User uploads a PDF (or PNG/JPG) file
2. `pdfjs-dist` extracts raw text from the PDF in the browser
3. Text is normalized (whitespace, casing)
4. Regex-based field parsers scan for labeled values:
   - `extractPercentage()` — finds "Class 10 Percentage: 93%"
   - `extractSatScore()` — finds "SAT Score: 1450"
   - `extractIeltsScore()` — finds "IELTS: 7.5"
   - `extractStudentName()` — finds "Student Name: Demo Student"
5. Each extracted field gets a confidence level:
   - **HIGH** — exact label match (e.g. "SAT Score: 1450")
   - **MEDIUM** — less precise match
   - **LOW** — ambiguous value
6. If extraction fails (no text, no fields, unsupported file), a user-friendly message is shown — no invented data

## Validation Logic

Deterministic rules (no AI):

- Full name required (min 2 chars)
- Email must be valid format
- Percentages must be 0–100
- SAT score must be 400–1600
- IELTS score must be 0–9
- If SAT taken → SAT score required
- Target university required
- Intended major required
- Academic document recommended

Each issue has: `id`, `field`, `severity` (CRITICAL/WARNING/INFO), `title`, `message`, `suggestedFix`, `resolved`.

## Verification Logic

Compares submitted form values against extracted document values:

- Values match → **PASS**
- Values differ + HIGH/MEDIUM confidence → **CONFLICT**
- Values differ + LOW confidence → **POSSIBLE_CONFLICT** (manual review recommended)
- No extracted value → **NOT_VERIFIED**

## Application Health

Deterministic weighted score (NOT admission probability):

| Category | Weight |
|----------|--------|
| Personal information | 15 |
| Academics | 25 |
| Tests | 15 |
| University information | 15 |
| Documents | 20 |
| Verification | 10 |
| **Total** | **100** |

Unresolved critical issues apply a penalty.

## Database Structure

Tables created via Supabase migration:

- `ai_applications` — application data + health score + status
- `ai_application_documents` — uploaded document metadata + extracted text
- `ai_application_issues` — validation/verification issues
- `ai_verification_checks` — field-by-field verification results
- `ai_processing_logs` — audit trail

All tables use Row Level Security with `user_id` owner-scoped policies.

## Security

- RLS enabled on all tables
- `user_id` defaults to `auth.uid()` on insert
- Users can only access their own data
- Service role key never exposed in browser code
- No external API keys required

## Testing

Tested scenarios:

1. Complete correct application → READY_FOR_REVIEW
2. SAT = 1800 → validation failure (out of range)
3. Submitted 95%, document 93% → conflict detected
4. Submitted SAT 1480, document 1450 → conflict detected
5. Correct conflict → issue resolved, health updates
6. Unsupported file → user-friendly error
7. PDF with no recognizable values → manual review message
8. Low-confidence extraction → warning instead of hard conflict

## Known Limitations

- Text-based PDFs provide the most reliable extraction
- Scanned or image-only PDFs are not OCR'd in the current build (Tesseract.js can be added for P1)
- The system detects inconsistencies but does not certify document authenticity
- The system does not predict college admission outcomes
- Application Health measures completeness and consistency, not admission probability

## How To Run

```bash
npm install
npm run dev    # development
npm run build  # production build
```

## Demo Instructions

1. Navigate to **App Intelligence** in the sidebar
2. Click **Download demo document** — saves a .txt file with 93% and SAT 1450
3. Fill the form:
   - Step 1: Enter name, email, school, grade
   - Step 2: Enter Class 10 = **95%** (intentionally different from document)
   - Step 3: Toggle SAT taken = Yes, enter SAT = **1480** (intentionally different)
   - Step 4: Enter target university and major
   - Step 5: Upload the demo document as "Academic Document", click **Extract**
4. Click **Analyze Application**
5. Watch the processing pipeline run in real-time
6. See **2 CONFLICTS DETECTED** in the Verification Matrix
7. Click **Correction Center**
8. Fix the Class 10 % to 93% and SAT to 1450
9. Click **Re-run Checks**
10. See **Application Health: 100%** and **READY FOR REVIEW**
11. Click **Reviewer Preview** to see the full reviewer dashboard

## AI Disclosure

This project uses **no AI** for its core functionality. Document extraction uses pdfjs-dist (a Mozilla open-source PDF parser). Field parsing uses deterministic regex. Validation and verification use deterministic TypeScript rules. The "Application Intelligence" name refers to automated rule-based processing, not machine learning or AI inference.

## Files Changed

- `src/components/ApplicationIntelligence.tsx` — full UI (form, processing, results, correction, reviewer)
- `src/lib/extraction.ts` — PDF text extraction + field parser + confidence
- `src/lib/validation.ts` — deterministic validation rules + health score
- `src/lib/verification.ts` — submitted vs document comparison engine
- `src/App.tsx` — added App Intelligence nav item and route
- `src/index.css` — styles for the new module
- `index.html` — updated title and meta tags
- `supabase/migrations/20261004083348_create_application_intelligence.sql` — database tables + RLS

## New Dependencies

- `pdfjs-dist` — Mozilla's PDF.js for free browser-side PDF text extraction
