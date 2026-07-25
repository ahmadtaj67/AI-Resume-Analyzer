# AI Resume Analyzer

A recruiter-level AI Resume Analyzer planned for resume upload, AI-assisted evaluation, report history, and role-based dashboards.

## Planned Features

- JWT-based user authentication
- PDF resume upload
- Resume text extraction
- Gemini AI resume analysis
- User dashboard for reports and history
- Admin dashboard for platform oversight
- Supabase PostgreSQL persistence
- Responsive recruiter-focused UI
- Vercel frontend deployment
- Render backend deployment

## Technology Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: Supabase PostgreSQL
- Authentication: JWT
- AI: Gemini AI
- File Uploads: PDF resume uploads
- Deployment: Vercel and Render

## Folder Structure

```text
AI-Resume-Analyzer/
|-- client/
|-- server/
|-- docs/
|   |-- architecture.md
|   `-- roadmap.md
|-- .gitignore
`-- README.md
```

## Current Status

Phase 7E - Resume Report Persistence complete

## Phase 7A Completion Summary

- Professional authenticated User Dashboard foundation added
- Responsive desktop sidebar and mobile navigation added
- Authenticated-user dashboard header, overview cards, quick actions, and profile summary added
- Resume upload placeholder only; no upload functionality added
- Recent reports empty state only; no report APIs or fake report records added
- Existing AuthContext logout reused
- No Gemini AI integration added
- Build result: passed

## Phase 7B Completion Summary

- Protected `POST /api/resumes/upload` endpoint added
- Existing JWT authentication middleware reused
- PDF-only upload validation added
- Maximum resume file size validation added: 5 MB
- Multer memory storage used; no permanent file storage added
- Frontend PDF selection and validation upload UI added
- Safe upload success and error states added
- No PDF parsing added
- No Gemini AI integration added
- No report record creation or fake report data added
- Frontend build result: passed
- Frontend lint result: passed with one existing AuthContext Fast Refresh warning
- Backend endpoint tests: passed

## Phase 7C Completion Summary

- Protected `POST /api/resumes/extract-text` endpoint added
- Existing JWT authentication middleware reused
- Existing Multer PDF validation and memory storage reused
- PDF text is parsed from the uploaded buffer in memory
- Extracted text is cleaned, trimmed, and limited before returning a preview
- Page count, word count, and character count returned when extraction succeeds
- Scanned, image-only, empty, corrupted, oversized, and encrypted PDFs return safe JSON errors
- No OCR added
- No Gemini AI integration added
- No ATS score calculated
- No report record created
- No Supabase Storage or permanent local file storage added
- Backend tests: passed for health, database health, auth, upload validation, extraction success, and extraction failure cases
- Frontend dev server: launched successfully
- Frontend responsive check: passed at 1440px, 1024px, 768px, 430px, 375px, and 320px with no horizontal overflow
- Frontend build result: passed
- Frontend lint result: passed with one existing AuthContext Fast Refresh warning
- Dependency audit result: `npm audit --omit=dev` found 0 vulnerabilities

## Phase 7D Completion Summary

- Official `@google/genai` SDK added for backend-only Gemini integration
- Configurable `GEMINI_MODEL` added with default `gemini-2.5-flash`
- Protected `POST /api/resumes/analyze` endpoint added
- Existing JWT authentication middleware reused
- Existing secure Multer PDF validation reused
- Existing PDF text extraction utility reused before AI analysis
- Gemini API key remains backend-only; no frontend Gemini key or browser Gemini call added
- One structured JSON Gemini request is used for analysis
- Server-side validation normalizes and checks every AI field before responding
- Prompt-injection precautions treat resume text as untrusted data
- Temporary analysis includes resume quality score, professional summary, strengths, weaknesses, detected skills, missing sections, suggestions, and ATS checks
- Frontend analysis result UI added with temporary-result notice and score disclaimer
- Dashboard metrics remain truthful: no report count update, no latest score update, and no recent report insertion
- Missing `GEMINI_API_KEY` returns safe 503 from analysis endpoint while health/auth continue working
- Invalid Gemini key returns a safe provider error
- No OCR added
- No job matching added
- No protected-trait inference or hiring decision added
- No report persistence, Supabase insert, Supabase Storage, or permanent local PDF storage added
- Backend tests: passed for health, database health, auth, upload, extract-text, missing key, invalid key, auth failures, invalid files, oversized PDF, corrupt PDF, scanned PDF, and inactive user
- Live Gemini success test skipped because no real Gemini key is configured in this environment
- Frontend build result: passed
- Frontend lint result: passed with one existing AuthContext Fast Refresh warning
- Dependency audit result: `npm audit --omit=dev` found 0 vulnerabilities; full `npm audit` reports one high-severity `brace-expansion` advisory

## Phase 7E Completion Summary

- Successful validated Gemini analysis is now persisted in the existing `resume_reports` table
- Reports are owned by the authenticated `req.user.id`
- Protected `GET /api/resumes/dashboard-summary` endpoint added
- Dashboard summary returns Total Reports, Latest Score, and up to 5 Recent Reports
- Recent reports are scoped to the logged-in user and sorted newest first
- `original_file_name`, `overall_score`, and validated `analysis_result` are saved
- `stored_file_url` remains null because the original PDF is not stored
- `resume_text` remains null because full extracted text is not stored
- AI model metadata is stored inside validated `analysis_result.metadata`
- Frontend dashboard metrics now load from the backend summary endpoint
- Recent Reports list added without dead detail links
- Analyze flow saves the report in the same backend request that extracts and analyzes the resume
- Browser never submits AI analysis JSON for persistence
- User isolation tested with two users
- Empty dashboard state returns `totalReports: 0`, `latestScore: null`, and `recentReports: []`
- Database insert failure returns a safe save error without fake success
- Gemini failure creates no report row
- No PDF storage, Supabase Storage, report details page, full history page, report deletion, admin features, OCR, or job matching added
- Backend tests: passed for dashboard summary, upload-only, extract-only, missing key, invalid auth, invalid files, scanned PDF, insert failure handling, two-user isolation, and mocked analyze-and-save persistence path
- Live Gemini analyze-and-save returned a safe provider error in this environment, so no live report was inserted
- Frontend build result: passed
- Frontend lint result: passed with one existing AuthContext Fast Refresh warning
- Dependency audit result: `npm audit --omit=dev` found 0 vulnerabilities; full `npm audit` reports one high-severity `brace-expansion` advisory

## Setup Instructions

Coming in later phases.







