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

Phase 8C - Final QA, Bug Fixing and Documentation complete

## Main Features

- User registration and login with JWT authentication
- Protected user dashboard with saved report metrics
- PDF resume upload with in-memory validation
- PDF text extraction for selectable-text resumes
- Gemini-powered resume analysis when `GEMINI_API_KEY` is configured
- Saved resume report history and report details
- Profile management with full name update and password change
- Admin dashboard with user/report oversight and activate/deactivate controls
- Responsive React interface for desktop, tablet, and mobile
- Production-ready environment configuration and Docker packaging

## Current Project Structure

```text
AI-Resume-Analyzer/
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- layouts/
|   |   |-- pages/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- styles/
|   |   `-- utils/
|   |-- Dockerfile
|   |-- nginx.conf
|   |-- package.json
|   `-- vite.config.js
|-- server/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- prompts/
|   |   |-- routes/
|   |   |-- services/
|   |   `-- utils/
|   |-- supabase/
|   |   `-- migrations/
|   |-- Dockerfile
|   `-- package.json
|-- docs/
|-- docker-compose.yml
|-- .dockerignore
|-- .gitignore
`-- README.md
```

## Local Installation

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd client
npm install
```

Create local environment files from the examples:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Never commit real `.env` files.

## Environment Variables

Backend variables in `server/.env`:

- `PORT`
- `NODE_ENV`
- `CLIENT_URL`
- `CORS_ORIGINS`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `BCRYPT_SALT_ROUNDS`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `RESUME_MAX_FILE_SIZE_MB`
- `RESUME_MIN_TEXT_LENGTH`
- `MAX_EXTRACTED_TEXT_CHARACTERS`
- `EXTRACTED_TEXT_PREVIEW_CHARACTERS`

Frontend variable in `client/.env`:

- `VITE_API_BASE_URL`

Secrets such as `SUPABASE_SECRET_KEY`, `JWT_SECRET`, and `GEMINI_API_KEY` must stay backend-only.

## Supabase Setup

Run the SQL migration in:

```text
server/supabase/migrations/001_initial_schema.sql
```

The migration creates:

- `profiles`
- `resume_reports`
- UUID defaults
- constraints and indexes
- automatic `updated_at` triggers
- Row Level Security enabled without public browser policies

The Express backend uses the server-side Supabase key and enforces user/admin authorization.

## Gemini Setup

Set `GEMINI_API_KEY` in `server/.env` to enable live AI analysis. Without a key, the analysis endpoint returns a safe temporary-unavailable response while the rest of the app continues to work.

## Development Commands

Backend:

```bash
cd server
npm run dev
npm start
```

Frontend:

```bash
cd client
npm run dev
npm run build
npm run lint
npm run preview
```

## Production Build

Build the frontend:

```bash
cd client
npm run build
```

Start the backend:

```bash
cd server
npm start
```

## API Endpoint Summary

Health:

- `GET /api/health`
- `GET /api/health/database`

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Profile:

- `GET /api/profile`
- `PUT /api/profile`
- `PUT /api/profile/password`

Resumes and reports:

- `POST /api/resumes/upload`
- `POST /api/resumes/extract-text`
- `POST /api/resumes/analyze`
- `GET /api/resumes/dashboard-summary`
- `GET /api/resumes/reports`
- `GET /api/resumes/reports/:reportId`

Admin:

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `GET /api/admin/reports`
- `PUT /api/admin/users/:userId/status`

## User Flow

1. Register or log in.
2. Open the dashboard.
3. Upload a selectable-text PDF resume.
4. Run AI analysis when Gemini is configured.
5. Review the saved report.
6. View report history and report details.
7. Manage profile details and password.

## Admin Flow

1. Log in with an admin account.
2. Open the admin dashboard.
3. Review platform statistics.
4. View users and reports.
5. Activate or deactivate non-admin target users when needed.

Admin authorization is verified by the backend from the authenticated database profile.

## Deployment Guidance

- Deploy the backend to Render, Railway, Fly.io, a VPS, or a Docker host.
- Deploy the frontend to Vercel, Netlify, static hosting, or Docker/nginx.
- Set `VITE_API_BASE_URL` to the deployed backend `/api` URL before building the frontend.
- Set backend `CLIENT_URL` or `CORS_ORIGINS` to the deployed frontend origin.
- Keep Supabase and Gemini secrets only in the backend runtime environment.

## Security Notes

- Passwords are hashed with bcrypt.
- JWT secrets are required at backend startup.
- Password hashes are never returned by API responses.
- Protected routes require a valid bearer token.
- Admin routes verify role server-side and never trust frontend role claims alone.
- Resume PDFs are processed in memory; original files are not permanently stored.
- Real `.env` files are ignored by Git and Docker build context.
- Helmet is enabled and Express `x-powered-by` is disabled.
- CORS uses an environment-driven allowlist.

## Known Limitations

- OCR is not implemented; scanned/image-only PDFs are rejected safely.
- Live Gemini analysis requires a configured `GEMINI_API_KEY`.
- Supabase is external and is not included in Docker Compose.
- There is no password reset email flow yet.
- There is no report deletion or admin role-management UI.
- Server audit currently reports a `brace-expansion` advisory; no automatic fix was applied.
- Client audit currently reports React Router advisories that require an upstream-compatible package decision; no automatic force fix was applied.

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
- Dependency audit result: server `npm audit --omit=dev` found 0 vulnerabilities; client `npm audit --omit=dev` reports two high-severity React Router advisories

## Phase 7F Completion Summary

- Protected `GET /api/resumes/reports` endpoint added for paginated report history
- Protected `GET /api/resumes/reports/:reportId` endpoint added for single saved report details
- Report history uses database-backed pagination with default limit 10 and maximum limit 25
- Reports are scoped to the authenticated user and sorted newest first
- Report list returns safe summary fields only and does not return full saved analysis JSON
- Report details return the saved analysis, extraction summary, score, file name, model, and dates
- Missing, malformed, or another user's report returns the same safe 404 response
- Reports History page and Report Details page added behind the existing protected routing
- Dashboard Recent Reports now links to saved report details and View All Reports links to history
- Opening saved reports does not rerun Gemini, upload the PDF, retrieve the PDF, edit reports, or delete reports
- No admin report access was added
- Backend tests: passed
- Frontend build result: passed
- Frontend lint result: passed with one existing AuthContext Fast Refresh warning
- Dependency audit result: `npm audit --omit=dev` found 0 vulnerabilities; full `npm audit` reports one high-severity `brace-expansion` advisory

## Phase 7G Completion Summary

- Protected `GET /api/profile` endpoint added for the authenticated user's profile
- Protected `PUT /api/profile` endpoint added for updating full name only
- Protected `PUT /api/profile/password` endpoint added for password changes
- Profile updates use `req.user.id`; the browser never supplies a user ID
- Email remains read-only and password hashes are never returned
- Password changes verify the current password and hash the new password with the existing password utility
- Profile page added at `/profile` behind the existing protected routing
- Profile page displays full name, email, role, and joined date
- Full name update and password change forms include loading, success, and safe error states
- Dashboard/sidebar/mobile navigation now include a real Profile link
- No admin functionality was added
- Backend tests: passed for profile load, name update, weak password rejection, wrong current password rejection, password change, old password rejection, new password login, unauthorized profile request, and existing dashboard summary
- Frontend build result: passed
- Frontend lint result: passed with one existing AuthContext Fast Refresh warning

## Phase 7H Completion Summary

- Protected admin API mounted at `/api/admin`
- Admin-only `GET /api/admin/dashboard` endpoint added for total users, active users, and total reports
- Admin-only `GET /api/admin/users` endpoint added for paginated users
- Admin-only `GET /api/admin/reports` endpoint added for paginated saved reports
- Admin-only `PUT /api/admin/users/:userId/status` endpoint added for activating and deactivating users
- Backend verifies admin access from the authenticated server-side user profile, never from frontend role claims
- Non-admin users receive safe `403` responses from admin endpoints
- Admin users cannot deactivate their own account from the admin panel
- Admin Dashboard, Admin Users, and Admin Reports pages added
- Admin pages include loading, empty, and error states
- Admin pages reuse the existing dashboard shell, header, navigation, cards, and pagination controls
- Admin navigation is responsive on desktop and mobile
- No report editing, report deletion, user deletion, role editing, or Phase 8 functionality was added
- Backend tests: passed for admin login, non-admin 403, dashboard statistics, users list, reports list, deactivate, reactivate, inactive-user login rejection, and malformed ID handling
- Frontend build result: passed
- Frontend lint result: passed with one existing AuthContext Fast Refresh warning

## Phase 8A Completion Summary

- Backend startup now validates core production environment variables before listening
- Backend CORS now uses `CLIENT_URL` and optional comma-separated `CORS_ORIGINS`
- Production requires at least one frontend origin through `CLIENT_URL` or `CORS_ORIGINS`
- Express `x-powered-by` header is disabled
- Helmet remains enabled for production security headers
- JSON request body parsing uses a conservative size limit
- Graceful shutdown now guards against duplicate shutdown signals and force-exits after timeout
- Frontend API client uses `VITE_API_BASE_URL` with localhost fallback only in development
- Real `.env` files remain ignored while `.env.example` files stay tracked
- No API routes, dashboards, authentication behavior, admin behavior, or AI features were changed
- Backend health check: passed
- Frontend build result: passed
- Frontend lint result: passed with one existing AuthContext Fast Refresh warning

## Phase 8B Completion Summary

- Production Dockerfile added for the Express backend
- Production Dockerfile added for the React frontend
- Frontend Docker image builds the Vite app and serves static files with nginx
- Root Docker Compose setup added for frontend and backend services
- Docker Compose does not include Supabase because Supabase remains an external service
- Root `.dockerignore` added to keep dependencies, builds, logs, temporary uploads, and real environment files out of Docker build contexts
- Docker health check uses the existing backend `/api/health` endpoint
- Docker setup uses environment variables only; no secrets or deployment URLs are hardcoded
- Existing APIs and application behavior were not changed
- Frontend build result: passed
- Frontend lint result: passed with one existing AuthContext Fast Refresh warning

## Phase 8C Completion Summary

- Final backend smoke tests completed for health, auth, profile, resume upload, PDF extraction, reports, and admin access
- Missing and invalid tokens return safe unauthorized responses
- Non-admin admin access returns a safe forbidden response
- Invalid report and admin user IDs return safe not-found responses
- Password hashes were not present in tested user, profile, or admin responses
- User report isolation was verified with separate disposable users
- Gemini analysis returned a safe `503` because no live Gemini key is configured in this local environment
- CORS denial now returns a safe JSON `403` instead of a generic server error
- Frontend production build passed
- Frontend lint passed with one existing AuthContext Fast Refresh warning
- Docker Compose config validation passed; Docker image runtime tests were skipped because the Docker daemon is unavailable locally
- Full npm audits completed; advisories are documented in Known Limitations and were not auto-fixed
- Documentation finalized with setup, environment, Supabase, Gemini, Docker, API, deployment, security, and known limitation notes

## Setup Instructions

### Backend

Create `server/.env` from `server/.env.example` and set:

- `NODE_ENV=production`
- `PORT`
- `CLIENT_URL` for one frontend origin, or `CORS_ORIGINS` for comma-separated frontend origins
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `JWT_SECRET`
- Optional resume/Gemini limits and `GEMINI_API_KEY`

Keep `SUPABASE_SECRET_KEY`, `JWT_SECRET`, and `GEMINI_API_KEY` backend-only.

### Frontend

Create `client/.env` from `client/.env.example` and set:

- `VITE_API_BASE_URL=https://your-backend-domain.example/api`

Local development can omit `VITE_API_BASE_URL`; the frontend falls back to `http://localhost:5000/api` only while running Vite in development mode.

### Production Build

Install dependencies separately in `server` and `client`.

Run the frontend production build from `client`:

```bash
npm run build
```

Start the backend from `server`:

```bash
npm start
```

### Docker Build

Build the backend image from the project root:

```bash
docker build -f server/Dockerfile -t ai-resume-analyzer-backend .
```

Build the frontend image from the project root:

```bash
docker build -f client/Dockerfile -t ai-resume-analyzer-frontend --build-arg VITE_API_BASE_URL=http://localhost:5000/api .
```

### Docker Compose

Docker Compose runs:

- `backend` on `http://localhost:5000`
- `frontend` on `http://localhost:8080`

Supabase is not included in Docker Compose. Use your existing hosted Supabase project.

Before running Docker Compose, provide required backend values through your shell or a local Compose env file:

```bash
SUPABASE_URL=your-supabase-url
SUPABASE_SECRET_KEY=your-server-only-key
JWT_SECRET=your-jwt-secret
CLIENT_URL=http://localhost:8080
CORS_ORIGINS=http://localhost:8080
VITE_API_BASE_URL=http://localhost:5000/api
```

Then start the local production stack:

```bash
docker compose up --build
```

Stop the stack:

```bash
docker compose down
```

### Docker Environment Variables

Backend runtime variables:

- `NODE_ENV`
- `PORT`
- `CLIENT_URL`
- `CORS_ORIGINS`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `BCRYPT_SALT_ROUNDS`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `RESUME_MAX_FILE_SIZE_MB`
- `RESUME_MIN_TEXT_LENGTH`

Frontend build variable:

- `VITE_API_BASE_URL`

Keep `SUPABASE_SECRET_KEY`, `JWT_SECRET`, and `GEMINI_API_KEY` backend-only.







