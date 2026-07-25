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

Phase 7C - PDF Text Extraction Foundation complete

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

## Setup Instructions

Coming in later phases.







