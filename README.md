# AI Resume Analyzer

Production-ready full-stack AI Resume Analyzer for PDF resume upload, Gemini-powered structured analysis, saved report history, resume comparison, profile management, and admin analytics.

## Project Overview

AI Resume Analyzer helps users evaluate selectable-text PDF resumes through recruiter-style AI feedback. The application includes secure JWT authentication, Supabase PostgreSQL persistence, protected user dashboards, premium report details, stateless resume comparison, and admin tools for platform oversight.

## Features

- User registration, login, JWT sessions, and protected routes
- PDF resume upload with in-memory validation
- PDF text extraction for selectable-text resumes
- Gemini AI structured resume analysis
- Premium report details with overall score, ATS score, grade, hiring probability, section scores, skills, weaknesses, and recommendations
- Saved report history and report details
- Stateless comparison between two saved resume reports
- Profile management and password changes
- Admin dashboard, users, reports, platform settings, and analytics
- Admin user activation, deactivation, soft delete, and restore
- Responsive UI for desktop, tablet, and mobile
- Docker, Vercel, and Render deployment preparation

## Screenshots

Add screenshots before publishing the portfolio release:

- Login and registration
- User dashboard and upload flow
- Premium report details
- Resume comparison
- Admin dashboard
- Admin analytics
- Admin user management

## Technology Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, ES modules
- Database: Supabase PostgreSQL
- Authentication: JWT, bcrypt
- AI: Gemini via `@google/genai`
- Uploads: Multer memory storage, PDF parsing
- Security: Helmet, CORS allowlist, environment-only secrets
- Deployment: Vercel frontend, Render backend, Docker support

## Folder Structure

```text
AI-Resume-Analyzer/
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- hooks/
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
|-- render.yaml
|-- vercel.json
|-- LICENSE
`-- README.md
```

## Local Setup

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

Create local environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Run the backend:

```bash
cd server
npm run dev
```

Run the frontend:

```bash
cd client
npm run dev
```

## Environment Variables

Backend variables in `server/.env`:

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
- `GEMINI_MAX_OUTPUT_TOKENS`
- `MAX_RESUME_FILE_SIZE_MB`
- `MAX_EXTRACTED_TEXT_CHARACTERS`
- `EXTRACTED_TEXT_PREVIEW_CHARACTERS`
- `MAX_AI_RESUME_TEXT_CHARACTERS`

Frontend variable in `client/.env`:

- `VITE_API_BASE_URL`

Production environment checklist:

- Supabase URL: set `SUPABASE_URL` in the backend.
- Supabase anon key: not required by this app because the browser does not connect directly to Supabase.
- Supabase service role key: set `SUPABASE_SECRET_KEY` in the backend only.
- JWT secret: set `JWT_SECRET` in the backend only.
- Gemini API key: set `GEMINI_API_KEY` in the backend only.
- Client URL: set `CLIENT_URL` or `CORS_ORIGINS` in the backend to the deployed frontend origin.
- Server URL: set `VITE_API_BASE_URL` in the frontend to the deployed backend `/api` URL.

## Supabase Setup

Apply migrations in order from `server/supabase/migrations/`:

1. `001_initial_schema.sql`
2. `002_platform_settings.sql`
3. `003_profile_soft_delete.sql`

The schema stores application profiles, resume reports, platform settings, and soft-delete metadata. Row Level Security is enabled, and authorization is enforced by the trusted Express backend.

## Gemini Setup

Set `GEMINI_API_KEY` in the backend environment to enable live AI resume analysis and comparison narratives.

Recommended default:

```text
GEMINI_MODEL=gemini-3.5-flash
```

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

Frontend:

```bash
cd client
npm run build
```

Backend:

```bash
cd server
npm start
```

## Deployment Steps

### Vercel Frontend

1. Import the GitHub repository into Vercel.
2. Use the root `vercel.json` configuration, or set the project root to `client`.
3. Set `VITE_API_BASE_URL` to the deployed backend API URL, for example:

```text
https://your-render-service.onrender.com/api
```

4. Deploy and verify the frontend routes load after refresh.

### Render Backend

1. Create a Render Web Service or use the root `render.yaml` blueprint.
2. Set the service root directory to `server` if configuring manually.
3. Build command:

```bash
npm ci
```

4. Start command:

```bash
npm start
```

5. Set required backend environment variables in Render.
6. Verify:

```text
GET https://your-render-service.onrender.com/api/health
```

### Docker

Build and run with Docker Compose:

```bash
docker compose up --build
```

Supabase remains an external managed service and is not included in Docker Compose.

## API Endpoints

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

Resumes and Reports:

- `POST /api/resumes/upload`
- `POST /api/resumes/extract-text`
- `POST /api/resumes/analyze`
- `GET /api/resumes/dashboard-summary`
- `GET /api/resumes/reports`
- `GET /api/resumes/reports/:reportId`
- `GET /api/reports/compare/options`
- `POST /api/reports/compare`

Admin:

- `GET /api/admin/dashboard`
- `GET /api/admin/analytics/overview`
- `GET /api/admin/analytics/trends`
- `GET /api/admin/analytics/skills`
- `GET /api/admin/users`
- `GET /api/admin/users/:userId`
- `GET /api/admin/users/:userId/reports`
- `GET /api/admin/reports`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`
- `PUT /api/admin/users/:userId/status`
- `PATCH /api/admin/users/:userId/status`
- `DELETE /api/admin/users/:userId`

Settings:

- `GET /api/settings/public`

## Security Notes

- Real `.env` files are ignored by Git.
- Secrets are loaded only from environment variables.
- Supabase service role key stays backend-only.
- Gemini API key stays backend-only.
- Passwords are hashed with bcrypt.
- Password hashes are never returned by API responses.
- Protected routes require a valid bearer token.
- Admin routes verify role server-side.
- CORS is controlled by `CLIENT_URL` and `CORS_ORIGINS`.
- Helmet is enabled and Express `x-powered-by` is disabled.
- Uploaded PDFs are processed in memory and are not permanently stored.

## Production Checklist

- Frontend build passes
- Frontend lint passes
- Backend starts with production environment variables
- `/api/health` returns HTTP 200
- `/api/health/database` returns HTTP 200 when Supabase credentials are valid
- Vercel has `VITE_API_BASE_URL`
- Render has backend secrets and `CLIENT_URL`
- CORS allows the deployed frontend origin
- Supabase migrations are applied
- Gemini key is configured for live analysis
- Auth, upload, analysis, reports, comparison, profile, admin users, admin analytics, and admin settings are verified manually

## Portfolio Copy

Short summary:

```text
Full-stack AI Resume Analyzer with React, Express, Supabase, JWT auth, Gemini AI, PDF analysis, report history, resume comparison, and admin analytics.
```

Resume-ready description:

```text
Built a production-ready AI Resume Analyzer using React, Vite, Express, Supabase PostgreSQL, JWT authentication, and Gemini AI, including PDF parsing, structured AI reports, report history, resume comparison, profile management, admin user management, analytics dashboards, Docker setup, and deployment-ready documentation.
```

Additional portfolio assets are available in `docs/portfolio-assets.md`.

## Future Improvements

- Password reset email flow
- OCR for scanned PDF resumes
- Supabase Storage for optional file retention
- Job-description matching mode
- Report export to PDF
- Automated end-to-end browser tests
- Admin role-management workflow

## License

This project is licensed under the MIT License. See `LICENSE`.

## Credits

Built as a full-stack portfolio project using React, Vite, Node.js, Express, Supabase PostgreSQL, Gemini AI, and Docker-ready deployment workflows.
