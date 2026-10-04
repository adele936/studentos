import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, Clock, Download, Eye, FileText,
  Flag, FlaskConical, Loader2, RefreshCw, ShieldAlert, ShieldCheck, Sparkles, Upload, X, XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  extractFromFile, generateDemoDocument, isSupportedFileType,
} from '@/lib/extraction';
import type { ExtractionResult, ExtractedField } from '@/lib/extraction';
import {
  calculateHealth, determineStatus, validateApplication,
} from '@/lib/validation';
import type { ApplicationData, HealthBreakdown, ValidationIssue } from '@/lib/validation';
import {
  explainConflict, runVerification,
} from '@/lib/verification';
import type { VerificationCheck, VerificationResult } from '@/lib/verification';

type Phase = 'FORM' | 'PROCESSING' | 'RESULTS' | 'CORRECTION' | 'REVIEWER';
type AppStatus = 'DRAFT' | 'PROCESSING' | 'NEEDS_CORRECTION' | 'READY_FOR_REVIEW';

type UploadedDoc = {
  id: string;
  label: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  extractedText: string;
  extractionResult: ExtractionResult | null;
  fields: ExtractedField[];
};

type LogEntry = { event: string; detail: string; timestamp: string };

const emptyForm: ApplicationData = {
  full_name: '', email: '', school: '', current_grade: '',
  class9_pct: null, class10_pct: null, class11_pct: null, class12_pct_predicted: null,
  sat_taken: false, sat_score: null, ielts_taken: false, ielts_score: null,
  target_university: '', intended_major: '',
};

const formSteps = ['Personal', 'Academics', 'Tests', 'University', 'Documents'] as const;
const processingSteps = [
  'Checking application fields',
  'Reading supporting document',
  'Extracting structured information',
  'Comparing submitted information',
  'Calculating application health',
  'Preparing results',
] as const;

export function ApplicationIntelligence() {
  const [phase, setPhase] = useState<Phase>('FORM');
  const [formStep, setFormStep] = useState(0);
  const [form, setForm] = useState<ApplicationData>(emptyForm);
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [checks, setChecks] = useState<VerificationCheck[]>([]);
  const [health, setHealth] = useState<HealthBreakdown | null>(null);
  const [status, setStatus] = useState<AppStatus>('DRAFT');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [processingStep, setProcessingStep] = useState(-1);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const isAnalyzing = useRef(false);

  const addLog = useCallback((event: string, detail = '') => {
    setLogs((prev) => [...prev, { event, detail, timestamp: new Date().toLocaleTimeString() }]);
  }, []);

  const setField = <K extends keyof ApplicationData>(key: K, value: ApplicationData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (label: string, file: File, docId: string) => {
    if (!isSupportedFileType(file)) {
      alert('Unsupported file type. Please upload a PDF, PNG, or JPG.');
      return;
    }
    const doc: UploadedDoc = {
      id: docId, label, fileName: file.name, fileType: file.type || 'unknown',
      fileSize: file.size, extractedText: '', extractionResult: null, fields: [],
    };
    setDocs((prev) => [...prev, doc]);
    addLog('Document uploaded', `${label}: ${file.name}`);
  };

  const removeDoc = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const downloadDemoDoc = () => {
    const { content, fileName } = generateDemoDocument();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
  };

  const runAnalysis = async () => {
    if (isAnalyzing.current) return;
    isAnalyzing.current = true;
    setAnalyzeError(null);
    setPhase('PROCESSING');
    setProcessingStep(0);
    setStatus('PROCESSING');
    addLog('Validation started');

    // Step 1: Validate application fields
    const hasAcademicDoc = docs.some((d) => d.label === 'Academic Document');
    const hasSatDoc = docs.some((d) => d.label === 'SAT Report');
    const validationIssues = validateApplication(form, { hasAcademicDoc, hasSatDoc });
    setIssues(validationIssues);
    addLog('Validation completed', `${validationIssues.length} issue(s) found`);
    setProcessingStep(1);

    // Step 2: Extract text from documents
    const updatedDocs: UploadedDoc[] = [];
    for (const doc of docs) {
      const file = doc.fileName;
      addLog('Document text extraction started', file);
      // We need the actual File object — we'll re-read from the input
      // Since we stored metadata only, we extract during upload instead
      updatedDocs.push(doc);
    }

    // Extract from all docs that have fields
    let allExtractedFields: ExtractedField[] = [];
    let primaryDocLabel = '';
    for (const doc of updatedDocs) {
      if (doc.extractionResult?.status === 'SUCCESS' && doc.fields.length > 0) {
        allExtractedFields = [...allExtractedFields, ...doc.fields];
        if (!primaryDocLabel) primaryDocLabel = doc.label;
      }
    }
    setProcessingStep(2);
    addLog('Structured fields extracted', `${allExtractedFields.length} field(s) from documents`);

    // Step 3: Compare submitted vs document
    setProcessingStep(3);
    const { checks: verChecks, passed, conflicts, possibleConflicts } = runVerification(
      form as unknown as Record<string, unknown>,
      allExtractedFields,
      primaryDocLabel || 'Uploaded Document'
    );
    setChecks(verChecks);
    addLog('Verification started', `${passed} passed, ${conflicts} conflict(s), ${possibleConflicts} possible`);

    // Step 4: Calculate health
    setProcessingStep(4);
    const allIssues = [...validationIssues];
    // Add conflict-based issues
    for (const chk of verChecks) {
      if (chk.result === 'CONFLICT') {
        allIssues.push({
          id: `conflict_${chk.id}`,
          field: chk.field,
          severity: 'CRITICAL',
          title: `${chk.fieldLabel} mismatch`,
          message: explainConflict(chk),
          suggestedFix: `Verify your ${chk.fieldLabel.toLowerCase()} and update the submitted value if necessary.`,
          evidence: chk.documentLabel,
          resolved: false,
        });
      } else if (chk.result === 'POSSIBLE_CONFLICT') {
        allIssues.push({
          id: `possible_${chk.id}`,
          field: chk.field,
          severity: 'WARNING',
          title: `Possible ${chk.fieldLabel} mismatch`,
          message: `The document may contain a different ${chk.fieldLabel.toLowerCase()}. Confidence is low — manual review recommended.`,
          suggestedFix: `Review the document and confirm the correct ${chk.fieldLabel.toLowerCase()}.`,
          evidence: chk.documentLabel,
          resolved: false,
        });
      }
    }
    setIssues(allIssues);

    const healthResult = calculateHealth(form, allIssues, passed, verChecks.length, hasAcademicDoc, hasSatDoc);
    setHealth(healthResult);
    addLog('Application health calculated', `${healthResult.total}%`);

    // Step 5: Determine status
    setProcessingStep(5);
    const finalStatus = determineStatus(allIssues, conflicts + possibleConflicts, healthResult.total);
    setStatus(finalStatus as AppStatus);
    addLog('Application status determined', finalStatus);
    if (conflicts > 0) addLog(`${conflicts} conflict(s) detected`);
    addLog(`Application marked ${finalStatus}`);

    // Save to Supabase (best-effort)
    try {
      const { data: appRow } = await supabase.from('ai_applications').upsert({
        id: appId || undefined,
        full_name: form.full_name,
        email: form.email,
        school: form.school,
        current_grade: form.current_grade,
        class9_pct: form.class9_pct,
        class10_pct: form.class10_pct,
        class11_pct: form.class11_pct,
        class12_pct_predicted: form.class12_pct_predicted,
        sat_taken: form.sat_taken,
        sat_score: form.sat_score,
        ielts_taken: form.ielts_taken,
        ielts_score: form.ielts_score,
        target_university: form.target_university,
        intended_major: form.intended_major,
        health_score: healthResult.total,
        status: finalStatus,
      }).select('id').maybeSingle();

      if (appRow?.id) {
        setAppId(appRow.id);
        // Save logs
        for (const log of logs) {
          await supabase.from('ai_processing_logs').insert({
            application_id: appRow.id, event: log.event, detail: log.detail,
          });
        }
      }
    } catch {
      // Supabase may be unreachable — demo continues with local state
    }

    // Show results
    setPhase('RESULTS');
    isAnalyzing.current = false;
  };

  const rerunChecks = () => {
    // After corrections, re-validate and re-verify
    const hasAcademicDoc = docs.some((d) => d.label === 'Academic Document');
    const hasSatDoc = docs.some((d) => d.label === 'SAT Report');
    const validationIssues = validateApplication(form, { hasAcademicDoc, hasSatDoc });

    let allExtractedFields: ExtractedField[] = [];
    let primaryDocLabel = '';
    for (const doc of docs) {
      if (doc.extractionResult?.status === 'SUCCESS' && doc.fields.length > 0) {
        allExtractedFields = [...allExtractedFields, ...doc.fields];
        if (!primaryDocLabel) primaryDocLabel = doc.label;
      }
    }

    const { checks: verChecks, passed, conflicts, possibleConflicts } = runVerification(
      form as unknown as Record<string, unknown>,
      allExtractedFields,
      primaryDocLabel || 'Uploaded Document'
    );
    setChecks(verChecks);

    const allIssues = [...validationIssues];
    for (const chk of verChecks) {
      if (chk.result === 'CONFLICT') {
        allIssues.push({
          id: `conflict_${chk.id}`, field: chk.field, severity: 'CRITICAL',
          title: `${chk.fieldLabel} mismatch`, message: explainConflict(chk),
          suggestedFix: `Verify your ${chk.fieldLabel.toLowerCase()} and update the submitted value if necessary.`,
          evidence: chk.documentLabel, resolved: false,
        });
      } else if (chk.result === 'POSSIBLE_CONFLICT') {
        allIssues.push({
          id: `possible_${chk.id}`, field: chk.field, severity: 'WARNING',
          title: `Possible ${chk.fieldLabel} mismatch`,
          message: `The document may contain a different ${chk.fieldLabel.toLowerCase()}. Manual review recommended.`,
          suggestedFix: `Review the document and confirm the correct ${chk.fieldLabel.toLowerCase()}.`,
          evidence: chk.documentLabel, resolved: false,
        });
      }
    }
    setIssues(allIssues);

    const healthResult = calculateHealth(form, allIssues, passed, verChecks.length, hasAcademicDoc, hasSatDoc);
    setHealth(healthResult);
    const finalStatus = determineStatus(allIssues, conflicts + possibleConflicts, healthResult.total);
    setStatus(finalStatus as AppStatus);
    addLog('Verification rerun', `${conflicts} remaining conflict(s)`);
    addLog(`Application marked ${finalStatus}`);
    setPhase('RESULTS');
  };

  const fixIssue = (issueId: string, field: string, newValue: string | number) => {
    // Update the form field
    const numFields = ['class9_pct', 'class10_pct', 'class11_pct', 'class12_pct_predicted', 'sat_score', 'ielts_score'];
    const key = field as keyof ApplicationData;
    if (numFields.includes(field)) {
      setForm((prev) => ({ ...prev, [key]: parseFloat(String(newValue)) || null }));
    } else {
      setForm((prev) => ({ ...prev, [key]: newValue }));
    }
    // Mark issue as resolved
    setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, resolved: true } : i)));
    addLog('Application edited', `${field} updated`);
  };

  // ── Render ──────────────────────────────────────────────────

  if (phase === 'PROCESSING') {
    return (
      <div className="page-wrap page-fade">
        <div className="ai-processing">
          <div className="ai-processing-header">
            <Loader2 size={24} className="ai-spin" />
            <h2>Analyzing Application</h2>
            <p>Running validation, document extraction, and cross-verification.</p>
          </div>
          <div className="ai-processing-steps">
            {processingSteps.map((step, i) => (
              <div key={step} className={`ai-step ${i < processingStep ? 'done' : i === processingStep ? 'active' : ''}`}>
                <span className="ai-step-icon">
                  {i < processingStep ? <Check size={14} /> : i === processingStep ? <Loader2 size={14} className="ai-spin" /> : <span className="ai-step-num">{i + 1}</span>}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'RESULTS') {
    return (
      <div className="page-wrap page-fade">
        <ResultsView
          health={health}
          status={status}
          issues={issues}
          checks={checks}
          onCorrect={() => setPhase('CORRECTION')}
          onReviewer={() => setPhase('REVIEWER')}
          onBack={() => setPhase('FORM')}
        />
      </div>
    );
  }

  if (phase === 'CORRECTION') {
    return (
      <div className="page-wrap page-fade">
        <CorrectionCenter
          health={health}
          status={status}
          issues={issues}
          form={form}
          onFix={fixIssue}
          onRerun={rerunChecks}
          onBack={() => setPhase('RESULTS')}
        />
      </div>
    );
  }

  if (phase === 'REVIEWER') {
    return (
      <div className="page-wrap page-fade">
        <ReviewerView
          form={form}
          health={health}
          status={status}
          issues={issues}
          checks={checks}
          logs={logs}
          docs={docs}
          onBack={() => setPhase('RESULTS')}
        />
      </div>
    );
  }

  // FORM phase
  return (
    <div className="page-wrap page-fade">
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><ShieldCheck size={14} /> ALG-AUTO-02 · Smart Application Processing</div>
          <h1>Application Intelligence<span className="serif-dot">.</span></h1>
          <p className="subtitle">Verify applications before humans have to. Submit, upload, analyze, correct, review.</p>
        </div>
        <button className="outline-button" onClick={downloadDemoDoc}><Download size={14} /> Demo document</button>
      </div>

      {/* Why Application Intelligence section */}
      <div className="ai-why-section">
        <div className="ai-why-card">
          <span className="card-kicker">Traditional process</span>
          <ul>
            <li>Application submitted</li>
            <li>Human manually checks form</li>
            <li>Human manually opens documents</li>
            <li>Human finds discrepancy</li>
            <li>Applicant contacted</li>
            <li>Application checked again</li>
          </ul>
        </div>
        <div className="ai-why-arrow"><ArrowRight size={20} /></div>
        <div className="ai-why-card ai-why-card-highlight">
          <span className="card-kicker">Admitiy</span>
          <ul>
            <li>Application submitted</li>
            <li>Fields automatically validated</li>
            <li>Documents automatically read</li>
            <li>Claims cross-checked</li>
            <li>Problems explained</li>
            <li>Applicant corrects them</li>
            <li>Reviewer receives cleaner application</li>
          </ul>
        </div>
      </div>

      {/* Step indicator */}
      <div className="ai-form-steps">
        {formSteps.map((step, i) => (
          <button key={step} className={`ai-form-step ${i === formStep ? 'active' : ''} ${i < formStep ? 'done' : ''}`} onClick={() => setFormStep(i)}>
            <span className="ai-form-step-num">{i < formStep ? <Check size={13} /> : i + 1}</span>
            {step}
          </button>
        ))}
      </div>

      {/* Form content */}
      <div className="ai-form-card">
        {formStep === 0 && (
          <div className="ai-form-section">
            <h3>Personal information</h3>
            <div className="ai-form-grid">
              <div><label>Full Name</label><input className="auth-input" value={form.full_name} onChange={(e) => setField('full_name', e.target.value)} placeholder="Demo Student" /></div>
              <div><label>Email</label><input className="auth-input" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="demo@example.com" /></div>
              <div><label>School</label><input className="auth-input" value={form.school} onChange={(e) => setField('school', e.target.value)} placeholder="Demo Public School" /></div>
              <div><label>Current Grade</label>
                <select className="filter-select full" value={form.current_grade} onChange={(e) => setField('current_grade', e.target.value)}>
                  <option value="">Select grade</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {formStep === 1 && (
          <div className="ai-form-section">
            <h3>Academic record</h3>
            <div className="ai-form-grid ai-form-grid-4">
              <div><label>Class 9 %</label><input className="auth-input" type="number" min={0} max={100} value={form.class9_pct ?? ''} onChange={(e) => setField('class9_pct', e.target.value ? parseFloat(e.target.value) : null)} placeholder="0–100" /></div>
              <div><label>Class 10 %</label><input className="auth-input" type="number" min={0} max={100} value={form.class10_pct ?? ''} onChange={(e) => setField('class10_pct', e.target.value ? parseFloat(e.target.value) : null)} placeholder="0–100" /></div>
              <div><label>Class 11 %</label><input className="auth-input" type="number" min={0} max={100} value={form.class11_pct ?? ''} onChange={(e) => setField('class11_pct', e.target.value ? parseFloat(e.target.value) : null)} placeholder="0–100" /></div>
              <div><label>Predicted Class 12 %</label><input className="auth-input" type="number" min={0} max={100} value={form.class12_pct_predicted ?? ''} onChange={(e) => setField('class12_pct_predicted', e.target.value ? parseFloat(e.target.value) : null)} placeholder="0–100" /></div>
            </div>
          </div>
        )}

        {formStep === 2 && (
          <div className="ai-form-section">
            <h3>Standardized tests</h3>
            <div className="ai-form-grid">
              <div className="ai-toggle-row">
                <label>SAT taken?</label>
                <button className={`ai-toggle ${form.sat_taken ? 'on' : ''}`} onClick={() => setField('sat_taken', !form.sat_taken)}>{form.sat_taken ? 'Yes' : 'No'}</button>
              </div>
              {form.sat_taken && <div><label>SAT Score</label><input className="auth-input" type="number" min={400} max={1600} value={form.sat_score ?? ''} onChange={(e) => setField('sat_score', e.target.value ? parseInt(e.target.value) : null)} placeholder="400–1600" /></div>}
              <div className="ai-toggle-row">
                <label>IELTS taken?</label>
                <button className={`ai-toggle ${form.ielts_taken ? 'on' : ''}`} onClick={() => setField('ielts_taken', !form.ielts_taken)}>{form.ielts_taken ? 'Yes' : 'No'}</button>
              </div>
              {form.ielts_taken && <div><label>IELTS Score</label><input className="auth-input" type="number" min={0} max={9} step={0.5} value={form.ielts_score ?? ''} onChange={(e) => setField('ielts_score', e.target.value ? parseFloat(e.target.value) : null)} placeholder="0–9" /></div>}
            </div>
          </div>
        )}

        {formStep === 3 && (
          <div className="ai-form-section">
            <h3>University preferences</h3>
            <div className="ai-form-grid">
              <div><label>Target University</label><input className="auth-input" value={form.target_university} onChange={(e) => setField('target_university', e.target.value)} placeholder="e.g. University of Toronto" /></div>
              <div><label>Intended Major</label><input className="auth-input" value={form.intended_major} onChange={(e) => setField('intended_major', e.target.value)} placeholder="e.g. Computer Science" /></div>
            </div>
          </div>
        )}

        {formStep === 4 && (
          <div className="ai-form-section">
            <h3>Supporting documents</h3>
            <p className="ai-form-hint">Upload PDF, PNG, or JPG. The system reads the document and extracts fields automatically.</p>
            <div className="ai-upload-grid">
              <UploadSlot label="Academic Document" docs={docs} onUpload={(file, docId) => handleFileUpload('Academic Document', file, docId)} onRemove={removeDoc} onExtract={async (docId, file) => {
                const result = await extractFromFile(file);
                setDocs((prev) => prev.map((d) => d.id === docId ? {
                  ...d, extractedText: result.text, extractionResult: result, fields: result.fields,
                } : d));
                addLog('Document text extracted', `${file.name}: ${result.status}`);
              }} />
              <UploadSlot label="SAT Report" docs={docs} onUpload={(file, docId) => handleFileUpload('SAT Report', file, docId)} onRemove={removeDoc} onExtract={async (docId, file) => {
                const result = await extractFromFile(file);
                setDocs((prev) => prev.map((d) => d.id === docId ? {
                  ...d, extractedText: result.text, extractionResult: result, fields: result.fields,
                } : d));
                addLog('Document text extracted', `${file.name}: ${result.status}`);
              }} />
              <UploadSlot label="Other Document" docs={docs} onUpload={(file, docId) => handleFileUpload('Other Document', file, docId)} onRemove={removeDoc} onExtract={async (docId, file) => {
                const result = await extractFromFile(file);
                setDocs((prev) => prev.map((d) => d.id === docId ? {
                  ...d, extractedText: result.text, extractionResult: result, fields: result.fields,
                } : d));
                addLog('Document text extracted', `${file.name}: ${result.status}`);
              }} />
            </div>
            <button className="outline-button ai-demo-btn" onClick={downloadDemoDoc}><Download size={13} /> Download demo document (contains 93% and 1450)</button>
          </div>
        )}

        {/* Form navigation */}
        <div className="ai-form-nav">
          {formStep > 0 && <button className="outline-button" onClick={() => setFormStep(formStep - 1)}>Back</button>}
          {formStep < 4 && <button className="primary-button" onClick={() => setFormStep(formStep + 1)}>Continue <ArrowRight size={14} /></button>}
          {formStep === 4 && <button className="primary-button ai-analyze-btn" onClick={runAnalysis}><Sparkles size={15} /> Analyze Application</button>}
        </div>
      </div>

      {analyzeError && <div className="ai-error-banner"><ShieldAlert size={16} /> {analyzeError}</div>}
    </div>
  );
}

// ── Upload slot component ─────────────────────────────────────

function UploadSlot({ label, docs, onUpload, onRemove, onExtract }: {
  label: string;
  docs: UploadedDoc[];
  onUpload: (file: File, docId: string) => void;
  onRemove: (id: string) => void;
  onExtract: (docId: string, file: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [extracting, setExtracting] = useState(false);
  const fileMap = useRef<Map<string, File>>(new Map());
  const myDocs = docs.filter((d) => d.label === label);

  const handleFile = async (file: File) => {
    const docId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    fileMap.current.set(docId, file);
    onUpload(file, docId);
    setExtracting(true);
    await onExtract(docId, file);
    setExtracting(false);
  };

  const handleManualExtract = async (docId: string) => {
    const file = fileMap.current.get(docId);
    if (!file) return;
    setExtracting(true);
    await onExtract(docId, file);
    setExtracting(false);
  };

  return (
    <div className="ai-upload-slot">
      <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
      <div className="ai-upload-label">{label}</div>
      {myDocs.length === 0 ? (
        <button className="ai-upload-btn" onClick={() => inputRef.current?.click()}>
          <Upload size={16} /><span>Upload file</span>
        </button>
      ) : (
        <div className="ai-doc-list">
          {myDocs.map((doc) => (
            <div key={doc.id} className="ai-doc-item">
              <FileText size={14} />
              <span className="ai-doc-name">{doc.fileName}</span>
              {doc.extractionResult?.status === 'SUCCESS' && <span className="ai-doc-badge ai-doc-ok">{doc.fields.length} fields</span>}
              {doc.extractionResult?.status === 'NO_TEXT' && <span className="ai-doc-badge ai-doc-warn">No text</span>}
              {doc.extractionResult?.status === 'NO_FIELDS' && <span className="ai-doc-badge ai-doc-warn">No fields</span>}
              {doc.extractionResult?.status === 'UNSUPPORTED' && <span className="ai-doc-badge ai-doc-err">Unsupported</span>}
              {doc.extractionResult?.status === 'ERROR' && <span className="ai-doc-badge ai-doc-err">Error</span>}
              {!doc.extractionResult && !extracting && <button className="ai-doc-extract" onClick={() => handleManualExtract(doc.id)}>Extract</button>}
              {extracting && <Loader2 size={12} className="ai-spin" />}
              <button className="ai-doc-remove" onClick={() => { fileMap.current.delete(doc.id); onRemove(doc.id); }}><X size={12} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Results view ──────────────────────────────────────────────

function ResultsView({ health, status, issues, checks, onCorrect, onReviewer, onBack }: {
  health: HealthBreakdown | null;
  status: string;
  issues: ValidationIssue[];
  checks: VerificationCheck[];
  onCorrect: () => void;
  onReviewer: () => void;
  onBack: () => void;
}) {
  const criticalCount = issues.filter((i) => !i.resolved && i.severity === 'CRITICAL').length;
  const warningCount = issues.filter((i) => !i.resolved && i.severity === 'WARNING').length;
  const passedChecks = checks.filter((c) => c.result === 'PASS').length;
  const conflictChecks = checks.filter((c) => c.result === 'CONFLICT').length;

  return (
    <>
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><CheckCircle2 size={14} /> Analysis complete</div>
          <h1>Application Analysis<span className="serif-dot">.</span></h1>
        </div>
        <button className="outline-button" onClick={onBack}>Back to form</button>
      </div>

      <div className="ai-result-hero">
        <div className={`ai-health-ring ${status === 'READY_FOR_REVIEW' ? 'green' : conflictChecks > 0 || criticalCount > 0 ? 'red' : 'amber'}`}>
          <strong>{health?.total ?? 0}<small>%</small></strong>
          <span>Application Health</span>
        </div>
        <div className="ai-result-meta">
          <div className={`ai-status-badge ${status === 'READY_FOR_REVIEW' ? 'green' : 'red'}`}>
            {status === 'READY_FOR_REVIEW' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
            {status.replace(/_/g, ' ')}
          </div>
          {criticalCount > 0 && <p><strong>{criticalCount}</strong> critical issue{criticalCount > 1 ? 's' : ''}</p>}
          {conflictChecks > 0 && <p><strong>{conflictChecks}</strong> conflict{conflictChecks > 1 ? 's' : ''} detected</p>}
          <p><strong>{passedChecks}</strong> check{passedChecks !== 1 ? 's' : ''} passed</p>
        </div>
      </div>

      {/* Verification matrix */}
      {checks.length > 0 && (
        <div className="ai-section">
          <h2>Verification Matrix</h2>
          <div className="ai-matrix">
            <div className="ai-matrix-header">
              <span>Field</span><span>Submitted</span><span>Document</span><span>Confidence</span><span>Result</span>
            </div>
            {checks.map((chk) => (
              <div key={chk.id} className={`ai-matrix-row ${chk.result === 'CONFLICT' ? 'conflict' : chk.result === 'PASS' ? 'pass' : chk.result === 'POSSIBLE_CONFLICT' ? 'possible' : 'unverified'}`}>
                <span>{chk.fieldLabel}</span>
                <span>{chk.submittedValue}</span>
                <span>{chk.documentValue}</span>
                <span className={`ai-confidence ai-conf-${chk.confidence.toLowerCase()}`}>{chk.confidence}</span>
                <span className={`ai-result-tag ai-res-${chk.result.toLowerCase().replace(/_/g, '-')}`}>
                  {chk.result === 'PASS' && <Check size={12} />}
                  {chk.result === 'CONFLICT' && <XCircle size={12} />}
                  {chk.result === 'POSSIBLE_CONFLICT' && <AlertTriangle size={12} />}
                  {chk.result === 'NOT_VERIFIED' && <Clock size={12} />}
                  {chk.result.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="ai-result-actions">
        {status !== 'READY_FOR_REVIEW' && (
          <button className="primary-button" onClick={onCorrect}><FlaskConical size={15} /> Correction Center</button>
        )}
        <button className="outline-button" onClick={onReviewer}><Eye size={15} /> Reviewer Preview</button>
      </div>

      {status === 'READY_FOR_REVIEW' && (
        <div className="ai-ready-banner">
          <CheckCircle2 size={20} />
          <div><strong>All blocking issues resolved.</strong><p>Your application is ready for review.</p></div>
        </div>
      )}
    </>
  );
}

// ── Correction center ─────────────────────────────────────────

function CorrectionCenter({ health, status, issues, form, onFix, onRerun, onBack }: {
  health: HealthBreakdown | null;
  status: string;
  issues: ValidationIssue[];
  form: ApplicationData;
  onFix: (issueId: string, field: string, newValue: string | number) => void;
  onRerun: () => void;
  onBack: () => void;
}) {
  const unresolved = issues.filter((i) => !i.resolved);
  const resolved = issues.filter((i) => i.resolved);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  return (
    <>
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><FlaskConical size={14} /> Resolve issues</div>
          <h1>Correction Center<span className="serif-dot">.</span></h1>
        </div>
        <button className="outline-button" onClick={onBack}>Back to results</button>
      </div>

      <div className="ai-correction-hero">
        <div className="ai-health-bar">
          <div className="ai-health-bar-label">
            <strong>Application Health</strong>
            <span>{health?.total ?? 0}%</span>
          </div>
          <div className="progress-track"><div style={{ width: `${health?.total ?? 0}%`, background: (health?.total ?? 0) >= 80 ? '#48ad82' : '#e9a36d' }} /></div>
        </div>
        <div className="ai-correction-counts">
          <span className="ai-count critical">{unresolved.filter((i) => i.severity === 'CRITICAL').length} critical</span>
          <span className="ai-count warning">{unresolved.filter((i) => i.severity === 'WARNING').length} warning</span>
          <span className="ai-count resolved">{resolved.length} resolved</span>
        </div>
      </div>

      <div className="ai-issue-list">
        {unresolved.length === 0 && resolved.length === 0 && (
          <div className="ai-empty-issues">No issues detected.</div>
        )}
        {unresolved.map((issue) => (
          <div key={issue.id} className={`ai-issue-card ${issue.severity.toLowerCase()}`}>
            <div className="ai-issue-header">
              <span className={`ai-severity-tag ${issue.severity.toLowerCase()}`}>
                {issue.severity === 'CRITICAL' ? <ShieldAlert size={13} /> : issue.severity === 'WARNING' ? <AlertTriangle size={13} /> : <Flag size={13} />}
                {issue.severity}
              </span>
              <strong>{issue.title}</strong>
            </div>
            <div className="ai-issue-body">
              <p className="ai-issue-explanation">{issue.message}</p>
              {issue.evidence && <p className="ai-issue-evidence"><FileText size={12} /> Evidence: {issue.evidence}</p>}
              <p className="ai-issue-fix"><Sparkles size={12} /> Suggested fix: {issue.suggestedFix}</p>
            </div>
            <div className="ai-issue-fix-row">
              <input className="auth-input" placeholder="Enter correct value" value={editValues[issue.id] ?? ''} onChange={(e) => setEditValues((prev) => ({ ...prev, [issue.id]: e.target.value }))} />
              <button className="primary-button" onClick={() => { const val = editValues[issue.id]; if (val !== undefined && val !== '') onFix(issue.id, issue.field, val); }}>
                <Check size={14} /> Fix Now
              </button>
            </div>
          </div>
        ))}
        {resolved.length > 0 && (
          <div className="ai-resolved-section">
            <h3>Resolved</h3>
            {resolved.map((issue) => (
              <div key={issue.id} className="ai-issue-card resolved">
                <div className="ai-issue-header">
                  <span className="ai-severity-tag resolved"><Check size={13} /> RESOLVED</span>
                  <strong>{issue.title}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ai-correction-actions">
        <button className="primary-button" onClick={onRerun}><RefreshCw size={15} /> Re-run Checks</button>
      </div>

      {status === 'READY_FOR_REVIEW' && (
        <div className="ai-ready-banner">
          <CheckCircle2 size={20} />
          <div><strong>All blocking issues resolved.</strong><p>Your application is ready for review.</p></div>
        </div>
      )}
    </>
  );
}

// ── Reviewer view ─────────────────────────────────────────────

function ReviewerView({ form, health, status, issues, checks, logs, docs, onBack }: {
  form: ApplicationData;
  health: HealthBreakdown | null;
  status: string;
  issues: ValidationIssue[];
  checks: VerificationCheck[];
  logs: LogEntry[];
  docs: UploadedDoc[];
  onBack: () => void;
}) {
  const passed = checks.filter((c) => c.result === 'PASS').length;
  const conflicts = checks.filter((c) => c.result === 'CONFLICT').length;
  const warnings = checks.filter((c) => c.result === 'POSSIBLE_CONFLICT').length + issues.filter((i) => !i.resolved && i.severity === 'WARNING').length;

  return (
    <>
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><Eye size={14} /> Reviewer Preview</div>
          <h1>Review Dashboard<span className="serif-dot">.</span></h1>
        </div>
        <button className="outline-button" onClick={onBack}>Back to results</button>
      </div>

      <div className="ai-reviewer-summary">
        <div className="ai-reviewer-card">
          <span className="card-kicker">Student</span>
          <strong>{form.full_name || '—'}</strong>
          <span>{form.email || '—'}</span>
        </div>
        <div className="ai-reviewer-card">
          <span className="card-kicker">University</span>
          <strong>{form.target_university || '—'}</strong>
          <span>{form.intended_major || '—'}</span>
        </div>
        <div className="ai-reviewer-card">
          <span className="card-kicker">Application Health</span>
          <strong>{health?.total ?? 0}%</strong>
          <span>{status.replace(/_/g, ' ')}</span>
        </div>
        <div className="ai-reviewer-card">
          <span className="card-kicker">Status</span>
          <div className={`ai-status-badge ${status === 'READY_FOR_REVIEW' ? 'green' : 'red'}`}>
            {status === 'READY_FOR_REVIEW' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            {status.replace(/_/g, ' ')}
          </div>
        </div>
      </div>

      <div className="ai-section">
        <h2>Verification Summary</h2>
        <div className="ai-summary-grid">
          <div className="ai-summary-stat pass"><Check size={18} /><strong>{passed}</strong><span>Passed Checks</span></div>
          <div className="ai-summary-stat conflict"><XCircle size={18} /><strong>{conflicts}</strong><span>Conflicts</span></div>
          <div className="ai-summary-stat warning"><AlertTriangle size={18} /><strong>{warnings}</strong><span>Warnings</span></div>
        </div>
      </div>

      {checks.length > 0 && (
        <div className="ai-section">
          <h2>Verification Matrix</h2>
          <div className="ai-matrix">
            <div className="ai-matrix-header">
              <span>Field</span><span>Submitted</span><span>Document</span><span>Confidence</span><span>Result</span>
            </div>
            {checks.map((chk) => (
              <div key={chk.id} className={`ai-matrix-row ${chk.result === 'CONFLICT' ? 'conflict' : chk.result === 'PASS' ? 'pass' : chk.result === 'POSSIBLE_CONFLICT' ? 'possible' : 'unverified'}`}>
                <span>{chk.fieldLabel}</span>
                <span>{chk.submittedValue}</span>
                <span>{chk.documentValue}</span>
                <span className={`ai-confidence ai-conf-${chk.confidence.toLowerCase()}`}>{chk.confidence}</span>
                <span className={`ai-result-tag ai-res-${chk.result.toLowerCase().replace(/_/g, '-')}`}>
                  {chk.result === 'PASS' && <Check size={12} />}
                  {chk.result === 'CONFLICT' && <XCircle size={12} />}
                  {chk.result === 'POSSIBLE_CONFLICT' && <AlertTriangle size={12} />}
                  {chk.result === 'NOT_VERIFIED' && <Clock size={12} />}
                  {chk.result.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="ai-section">
        <h2>Documents</h2>
        <div className="ai-doc-review">
          {docs.length === 0 && <p className="ai-empty">No documents uploaded.</p>}
          {docs.map((doc) => (
            <div key={doc.id} className="ai-doc-review-item">
              <FileText size={16} />
              <div><strong>{doc.label}</strong><span>{doc.fileName}</span></div>
              {doc.extractionResult?.status === 'SUCCESS' && <span className="ai-doc-badge ai-doc-ok">{doc.fields.length} fields extracted</span>}
              {doc.extractionResult?.status === 'NO_TEXT' && <span className="ai-doc-badge ai-doc-warn">No readable text</span>}
              {doc.extractionResult?.status === 'NO_FIELDS' && <span className="ai-doc-badge ai-doc-warn">No fields found</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="ai-section">
        <h2>Processing Timeline</h2>
        <div className="ai-timeline">
          {logs.map((log, i) => (
            <div key={i} className="ai-timeline-item">
              <span className="ai-timeline-dot" />
              <div><strong>{log.event}</strong>{log.detail && <span>{log.detail}</span>}</div>
              <time>{log.timestamp}</time>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
